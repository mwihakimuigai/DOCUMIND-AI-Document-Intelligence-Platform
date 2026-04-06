import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { aiService } from "./aiService.js";
import { pdfService } from "./pdfService.js";
import { storageService } from "./storageService.js";
import type { DocumentRecord } from "../models/types.js";

export class DocumentService {
  async listByUser(userId: string) {
    const documents = await storageService.listDocuments();
    return documents
      .filter((document) => document.userId === userId)
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }

  async getById(userId: string, documentId: string) {
    const store = await storageService.getStore();
    const index = store.documents.findIndex((item) => item.id === documentId && item.userId === userId);
    const document = index >= 0 ? store.documents[index] : undefined;
    if (!document) {
      throw new Error("Document not found.");
    }
    store.documents[index] = {
      ...document,
      viewCount: (document.viewCount ?? 0) + 1
    };
    await storageService.saveStore(store);
    return store.documents[index];
  }

  async createMany(userId: string, files: Express.Multer.File[]) {
    const store = await storageService.getStore();
    const created: DocumentRecord[] = [];

    for (const file of files) {
      const extractedText = await pdfService.extractText(file.path, file.originalname);
      const insight = await aiService.summarize(extractedText);

      const record: DocumentRecord = {
        id: uuidv4(),
        userId,
        filename: path.basename(file.filename),
        originalName: file.originalname,
        uploadDate: new Date().toISOString(),
        mimeType: file.mimetype,
        fileSize: file.size,
        extractedText,
        summary: insight.summary,
        keyPoints: insight.keyPoints,
        importantSections: insight.importantSections,
        keySentences: insight.keySentences,
        tags: this.deriveTags(extractedText),
        viewCount: 0,
        processedAt: new Date().toISOString(),
        aiModel: insight.model
      };

      store.documents.push(record);
      created.push(record);
    }

    await storageService.saveStore(store);
    return created;
  }

  async remove(userId: string, documentId: string) {
    const store = await storageService.getStore();
    const index = store.documents.findIndex((document) => document.id === documentId && document.userId === userId);

    if (index === -1) {
      throw new Error("Document not found.");
    }

    const [removed] = store.documents.splice(index, 1);
    await storageService.saveStore(store);

    const filePath = path.resolve(process.cwd(), "uploads", removed.filename);
    await fs.unlink(filePath).catch(() => undefined);

    return removed;
  }

  async combinedInsights(userId: string, documentIds?: string[]) {
    const documents = await this.listByUser(userId);
    const selected = documentIds?.length
      ? documents.filter((document) => documentIds.includes(document.id))
      : documents;
    const combinedText = selected.map((document) => document.extractedText).join("\n\n");
    const insight = await aiService.summarize(combinedText || "No documents selected.");

    return {
      documentCount: selected.length,
      summary: insight.summary,
      keyPoints: insight.keyPoints,
      importantSections: insight.importantSections,
      model: insight.model
    };
  }

  private deriveTags(text: string): string[] {
    const normalized = text.toLowerCase();
    const tags = [
      normalized.includes("risk") ? "risk" : null,
      normalized.includes("proposal") ? "proposal" : null,
      normalized.includes("review") ? "review" : null,
      normalized.includes("operations") ? "operations" : null,
      normalized.includes("finance") ? "finance" : null
    ].filter(Boolean);

    return tags.length > 0 ? (tags as string[]) : ["general"];
  }
}

export const documentService = new DocumentService();
