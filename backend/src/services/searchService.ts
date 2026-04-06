import { documentService } from "./documentService.js";
import type { SearchResult } from "../models/types.js";

export class SearchService {
  async search(userId: string, query: string) {
    const documents = await documentService.listByUser(userId);
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .map((term) => term.trim())
      .filter(Boolean);

    if (terms.length === 0) {
      return [] as SearchResult[];
    }

    return documents
      .map((document) => {
        const lowerText = document.extractedText.toLowerCase();
        const score = terms.reduce((sum, term) => sum + (lowerText.includes(term) ? 1 : 0), 0);
        if (score === 0) {
          return null;
        }

        const firstTerm = terms.find((term) => lowerText.includes(term)) ?? terms[0];
        const index = lowerText.indexOf(firstTerm);
        const start = Math.max(index - 80, 0);
        const end = Math.min(index + 180, document.extractedText.length);

        return {
          documentId: document.id,
          filename: document.originalName,
          snippet: document.extractedText.slice(start, end),
          score
        } satisfies SearchResult;
      })
      .filter((result): result is SearchResult => Boolean(result))
      .sort((a, b) => b.score - a.score);
  }

  highlight(snippet: string, query: string) {
    return query
      .split(/\s+/)
      .filter(Boolean)
      .reduce((current, term) => current.replace(new RegExp(`(${term})`, "gi"), "<mark>$1</mark>"), snippet);
  }
}

export const searchService = new SearchService();
