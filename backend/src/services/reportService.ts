import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { documentService } from "./documentService.js";
import type { ReportRecord } from "../models/types.js";

export class ReportService {
  async buildReport(userId: string, title: string, documentIds?: string[]): Promise<ReportRecord> {
    const documents = documentIds?.length
      ? (await documentService.listByUser(userId)).filter((document) => documentIds.includes(document.id))
      : await documentService.listByUser(userId);
    const combined = await documentService.combinedInsights(userId, documentIds);

    return {
      title,
      generatedAt: new Date().toISOString(),
      summary: combined.summary,
      keyInsights: combined.keyPoints,
      tableOfContents: [
        "1. Executive Summary",
        "2. Key Insights",
        "3. Important Sections",
        "4. Included Documents"
      ],
      documentIds: documents.map((document) => document.id)
    };
  }

  toText(report: ReportRecord) {
    return [
      report.title,
      `Generated: ${report.generatedAt}`,
      "",
      "Table of Contents",
      ...report.tableOfContents,
      "",
      "Summary",
      report.summary,
      "",
      "Key Insights",
      ...report.keyInsights.map((item, index) => `${index + 1}. ${item}`)
    ].join("\n");
  }

  async toPdf(report: ReportRecord) {
    const pdf = await PDFDocument.create();
    let page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const width = page.getWidth();
    const height = page.getHeight();
    let y = height - 50;

    for (const line of this.toText(report).split("\n")) {
      if (y < 40) {
        page = pdf.addPage([595, 842]);
        y = height - 50;
      }
      page.drawText(line, {
        x: 40,
        y,
        maxWidth: width - 80,
        size: line === report.title ? 18 : 10,
        font,
        color: rgb(0.12, 0.14, 0.24)
      });
      y -= line === report.title ? 26 : 14;
    }

    return Buffer.from(await pdf.save());
  }
}

export const reportService = new ReportService();
