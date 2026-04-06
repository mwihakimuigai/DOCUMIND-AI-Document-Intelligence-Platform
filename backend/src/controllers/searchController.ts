import type { Request, Response } from "express";
import { searchService } from "../services/searchService.js";

export class SearchController {
  async query(request: Request, response: Response) {
    const q = String(request.query.q ?? "").trim();
    const results = await searchService.search(request.auth!.userId, q);
    response.json({
      query: q,
      results: results.map((result) => ({
        ...result,
        highlightedSnippet: searchService.highlight(result.snippet, q)
      }))
    });
  }
}

export const searchController = new SearchController();
