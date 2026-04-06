import type { Request, Response } from "express";
import { aiService } from "../services/aiService.js";
import { chatService } from "../services/chatService.js";
import { documentService } from "../services/documentService.js";

export class InsightsController {
  async combined(request: Request, response: Response) {
    const documentIds = Array.isArray(request.body.documentIds) ? (request.body.documentIds as string[]) : undefined;
    const insights = await documentService.combinedInsights(request.auth!.userId, documentIds);
    response.json(insights);
  }

  async chat(request: Request, response: Response) {
    const question = String(request.body.question ?? "").trim();
    const sessionId = String(request.body.sessionId ?? "").trim();
    const documentIds = Array.isArray(request.body.documentIds) ? (request.body.documentIds as string[]) : undefined;
    const documents = documentIds?.length
      ? (await documentService.listByUser(request.auth!.userId)).filter((document) => documentIds.includes(document.id))
      : await documentService.listByUser(request.auth!.userId);

    if (!question) {
      response.status(400).json({ message: "A question is required." });
      return;
    }
    if (!sessionId) {
      response.status(400).json({ message: "A chat session id is required." });
      return;
    }
    if (documents.length === 0) {
      response.status(400).json({ message: "Upload and select at least one document before starting chat." });
      return;
    }

    chatService.append(sessionId, "user", question);
    const history = chatService.getHistory(sessionId);
    const answer = await aiService.answerQuestion(
      documents.map((document) => document.extractedText).join("\n\n"),
      question,
      history.map((message) => ({ role: message.role, content: message.content }))
    );
    const updatedHistory = chatService.append(sessionId, "assistant", answer);

    response.json({ answer, history: updatedHistory });
  }

  async compare(request: Request, response: Response) {
    const documentIds = Array.isArray(request.body.documentIds) ? (request.body.documentIds as string[]) : [];
    const documents = (await documentService.listByUser(request.auth!.userId)).filter((document) =>
      documentIds.includes(document.id)
    );
    const comparison = await aiService.compareDocuments(documents.map((document) => document.extractedText));
    response.json({ comparison });
  }
}

export const insightsController = new InsightsController();
