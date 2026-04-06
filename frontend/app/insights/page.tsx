"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/Shell";
import { ProtectedPage } from "../../components/ProtectedPage";
import {
  chatWithDocuments,
  compareDocuments,
  downloadReport,
  fetchCombinedInsights,
  getDocuments
} from "../../lib/api";
import type { ChatMessage, DocumentRecord } from "../../lib/types";

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function getChatSessionId() {
  const key = "documind_chat_session";
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }
  const created = `chat-${Date.now()}`;
  window.localStorage.setItem(key, created);
  return created;
}

export default function InsightsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [combined, setCombined] = useState<{
    documentCount: number;
    summary: string;
    keyPoints: string[];
    importantSections: string[];
    model: string;
  } | null>(null);
  const [question, setQuestion] = useState("What are the main risks across these documents?");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [comparison, setComparison] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      setLoadingInsights(true);
      setError("");
      try {
        const response = await getDocuments();
        setDocuments(response.documents);
        const firstIds = response.documents.slice(0, 2).map((document) => document.id);
        setSelectedIds(firstIds);
        if (response.documents.length > 0) {
          const insights = await fetchCombinedInsights(firstIds.length ? firstIds : undefined);
          setCombined(insights);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load AI insights.");
      } finally {
        setLoadingInsights(false);
      }
    })();
  }, []);

  const selectedCount = useMemo(() => selectedIds.length || documents.length, [documents.length, selectedIds.length]);

  async function refreshInsights(ids: string[]) {
    setSelectedIds(ids);
    if (ids.length === 0 && documents.length === 0) {
      setCombined(null);
      return;
    }
    setLoadingInsights(true);
    setError("");
    try {
      const insights = await fetchCombinedInsights(ids.length ? ids : undefined);
      setCombined(insights);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Failed to refresh combined insights.");
    } finally {
      setLoadingInsights(false);
    }
  }

  return (
    <ProtectedPage>
      <AppShell>
        <div className="grid">
          {error ? <div className="panel status-error">{error}</div> : null}

          <div className="panel stack">
            <div className="row">
              <h2 style={{ margin: 0 }}>Combined AI insights</h2>
              <span className="pill">{selectedCount} docs in view</span>
            </div>
            {documents.length === 0 ? (
              <p className="muted">Upload at least one document before opening AI insights.</p>
            ) : (
              <div className="three-col">
                {documents.map((document) => {
                  const checked = selectedIds.includes(document.id);
                  return (
                    <label key={document.id} className="doc-card">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const ids = event.target.checked
                            ? [...selectedIds, document.id]
                            : selectedIds.filter((id) => id !== document.id);
                          void refreshInsights(ids);
                        }}
                      />{" "}
                      {document.originalName}
                    </label>
                  );
                })}
              </div>
            )}

            {loadingInsights ? <p className="muted">Generating AI summary...</p> : null}
            {combined ? (
              <>
                <div className="stack">
                  <h3 style={{ margin: 0 }}>Summary</h3>
                  <p className="summary-block">{combined.summary}</p>
                </div>
                <div className="stack">
                  <h3 style={{ margin: 0 }}>Key points</h3>
                  <ul className="bullet-list">
                    {combined.keyPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>

          <div className="two-col">
            <div className="panel stack">
              <h2 style={{ margin: 0 }}>Chat with document</h2>
              {chatHistory.length === 0 ? (
                <p className="muted">Ask a question about the selected document set and the conversation will appear here.</p>
              ) : (
                <div className="chat-panel">
                  {chatHistory.map((message) => (
                    <div key={message.id} className={message.role === "user" ? "chat-bubble user" : "chat-bubble assistant"}>
                      <strong>{message.role === "user" ? "You" : "DocuMind AI"}</strong>
                      <div>{message.content}</div>
                    </div>
                  ))}
                </div>
              )}
              <input className="input" value={question} onChange={(event) => setQuestion(event.target.value)} />
              <button
                className="button"
                disabled={asking || documents.length === 0}
                onClick={async () => {
                  setAsking(true);
                  setError("");
                  try {
                    const response = await chatWithDocuments(question, getChatSessionId(), selectedIds.length ? selectedIds : undefined);
                    setChatHistory(response.history);
                    setQuestion("");
                  } catch (chatError) {
                    setError(chatError instanceof Error ? chatError.message : "Failed to get AI response.");
                  } finally {
                    setAsking(false);
                  }
                }}
              >
                {asking ? "Generating answer..." : "Ask question"}
              </button>
            </div>

            <div className="panel stack">
              <h2 style={{ margin: 0 }}>Comparison and export</h2>
              <button
                className="button secondary"
                disabled={documents.length === 0}
                onClick={async () => {
                  setError("");
                  try {
                    const response = await compareDocuments(selectedIds.length ? selectedIds : documents.map((document) => document.id));
                    setComparison(response.comparison);
                  } catch (comparisonError) {
                    setError(comparisonError instanceof Error ? comparisonError.message : "Failed to compare documents.");
                  }
                }}
              >
                Compare selected documents
              </button>
              <div className="stack">
                <h3 style={{ margin: 0 }}>Comparison summary</h3>
                <p className="summary-block">{comparison || "Generate a comparison to see how selected documents overlap."}</p>
              </div>
              <div className="row">
                <button
                  className="button"
                  disabled={documents.length === 0}
                  onClick={async () => {
                    const blob = await downloadReport("pdf", {
                      title: "DocuMind Intelligence Report",
                      documentIds: selectedIds.length ? selectedIds : undefined
                    });
                    triggerDownload(blob, "documind-report.pdf");
                  }}
                >
                  Export PDF
                </button>
                <button
                  className="button secondary"
                  disabled={documents.length === 0}
                  onClick={async () => {
                    const blob = await downloadReport("text", {
                      title: "DocuMind Intelligence Report",
                      documentIds: selectedIds.length ? selectedIds : undefined
                    });
                    triggerDownload(blob, "documind-report.txt");
                  }}
                >
                  Export text
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
