import fs from "node:fs/promises";
import pdfParse from "pdf-parse";

export class PdfService {
  async extractText(filePath: string, originalName: string): Promise<string> {
    try {
      const buffer = await fs.readFile(filePath);
      const parsed = await pdfParse(buffer);
      const cleaned = parsed.text.replace(/\s+/g, " ").trim();

      if (cleaned.length < 80) {
        throw new Error(
          `The PDF "${originalName}" does not contain enough selectable text. If it is scanned, OCR support is still required.`
        );
      }

      return cleaned;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : `Failed to extract text from "${originalName}".`
      );
    }
  }
}

export const pdfService = new PdfService();
