"use client";

import { useState } from "react";
import { AppShell } from "../../components/Shell";
import { ProtectedPage } from "../../components/ProtectedPage";
import { searchDocuments } from "../../lib/api";
import type { SearchResult } from "../../lib/types";

export default function SearchPage() {
  const [query, setQuery] = useState("risk roi rollout");
  const [results, setResults] = useState<SearchResult[]>([]);

  return (
    <ProtectedPage>
      <AppShell>
        <div className="grid">
          <div className="panel stack">
            <div className="row">
              <h2 style={{ margin: 0 }}>Search across documents</h2>
              <span className="pill">Keyword highlighting</span>
            </div>
            <div className="row">
              <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} />
              <button
                className="button"
                onClick={async () => {
                  const response = await searchDocuments(query);
                  setResults(response.results);
                }}
              >
                Search
              </button>
            </div>
          </div>

          <div className="panel stack">
            <h2 style={{ margin: 0 }}>Results</h2>
            {results.length === 0 ? (
              <p className="muted">Run a search to see highlighted excerpts from extracted document text.</p>
            ) : (
              results.map((result) => (
                <div key={`${result.documentId}-${result.score}`} className="doc-card">
                  <strong>{result.filename}</strong>
                  <p className="muted" dangerouslySetInnerHTML={{ __html: result.highlightedSnippet }} />
                </div>
              ))
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
