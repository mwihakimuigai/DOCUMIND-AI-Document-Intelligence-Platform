import type { DashboardMetrics, DocumentRecord } from "../models/types.js";
import { documentService } from "./documentService.js";

const STOP_WORDS = new Set([
  "the", "and", "for", "that", "with", "this", "from", "have", "your", "into", "their", "they", "them", "will",
  "then", "than", "been", "were", "which", "what", "when", "where", "about", "after", "before", "there", "here",
  "such", "could", "would", "should", "also", "only", "just", "very", "much", "more", "most", "into", "onto",
  "document", "documents", "summary", "summaries", "report", "reports"
]);

export class DashboardService {
  async getMetrics(userId: string): Promise<DashboardMetrics> {
    const documents = await documentService.listByUser(userId);
    const latest = documents[0] ?? null;
    const mostActive = [...documents].sort((a, b) => b.viewCount - a.viewCount || b.keyPoints.length - a.keyPoints.length)[0] ?? null;

    return {
      totalDocuments: documents.length,
      latestAiSummary: latest
        ? {
            documentId: latest.id,
            documentName: latest.originalName,
            summary: latest.summary,
            processedAt: latest.processedAt
          }
        : null,
      topKeywords: this.extractTopKeywords(documents),
      mostActiveDocument: mostActive
        ? {
            documentId: mostActive.id,
            documentName: mostActive.originalName,
            viewCount: mostActive.viewCount,
            summary: mostActive.summary
          }
        : null,
      recentUploads: documents.slice(0, 4)
    };
  }

  private extractTopKeywords(documents: DocumentRecord[]) {
    const counts = new Map<string, number>();

    for (const document of documents) {
      const words = document.extractedText.toLowerCase().match(/[a-z]{4,}/g) ?? [];
      for (const word of words) {
        if (STOP_WORDS.has(word)) {
          continue;
        }
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);
  }
}

export const dashboardService = new DashboardService();
