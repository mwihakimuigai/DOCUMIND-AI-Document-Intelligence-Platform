"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "../../components/Shell";
import { StatsCard } from "../../components/StatsCard";
import { ProtectedPage } from "../../components/ProtectedPage";
import { getDashboardMetrics, getDocuments } from "../../lib/api";
import type { DashboardMetrics, DocumentRecord } from "../../lib/types";

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError("");
      try {
        const [docs, dashboard] = await Promise.all([getDocuments(), getDashboardMetrics()]);
        setDocuments(docs.documents);
        setMetrics(dashboard);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ProtectedPage>
      <AppShell>
        <div className="grid">
          <section className="hero stack">
            <div className="pill">Production-style workspace</div>
            <h1 style={{ margin: 0 }}>Document intelligence built for faster review cycles</h1>
            <p className="muted">
              Upload PDFs, generate structured summaries, ask questions about document content, and export reports.
            </p>
          </section>

          {error ? <div className="panel status-error">{error}</div> : null}
          {loading ? <div className="panel">Loading dashboard data...</div> : null}

          <section className="stats-grid">
            <StatsCard label="Total documents" value={String(metrics?.totalDocuments ?? 0)} detail="Tracked in your workspace" />
            <StatsCard
              label="Key points extracted"
              value={String(documents.reduce((total, document) => total + document.keyPoints.length, 0))}
              detail="Stored AI key points across all processed files"
            />
            <StatsCard
              label="Most viewed"
              value={metrics?.mostActiveDocument ? String(metrics.mostActiveDocument.viewCount) : "0"}
              detail="Views on your most active document"
            />
          </section>

          <section className="three-col">
            <div className="panel stack">
              <div className="row">
                <h2 style={{ margin: 0 }}>Latest AI summary</h2>
                {metrics?.latestAiSummary ? (
                  <Link href={`/documents/${metrics.latestAiSummary.documentId}`} className="pill">
                    Open file
                  </Link>
                ) : null}
              </div>
              {metrics?.latestAiSummary ? (
                <>
                  <strong>{metrics.latestAiSummary.documentName}</strong>
                  <p className="summary-block">{metrics.latestAiSummary.summary}</p>
                </>
              ) : (
                <p className="muted">Upload a document to generate your first AI summary.</p>
              )}
            </div>

            <div className="panel stack">
              <h2 style={{ margin: 0 }}>Top keywords</h2>
              {metrics?.topKeywords.length ? (
                <div className="keyword-wrap">
                  {metrics.topKeywords.map((keyword) => (
                    <span key={keyword} className="pill">
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted">Keywords will appear after document text has been processed.</p>
              )}
            </div>

            <div className="panel stack">
              <h2 style={{ margin: 0 }}>Most active document</h2>
              {metrics?.mostActiveDocument ? (
                <>
                  <strong>{metrics.mostActiveDocument.documentName}</strong>
                  <div className="muted">{metrics.mostActiveDocument.viewCount} views</div>
                  <p className="summary-block">{metrics.mostActiveDocument.summary}</p>
                </>
              ) : (
                <p className="muted">Open a document to start tracking activity.</p>
              )}
            </div>
          </section>

          <section className="two-col">
            <div className="panel stack">
              <div className="row">
                <h2 style={{ margin: 0 }}>Recent uploads</h2>
                <span className="pill">{documents.length} tracked</span>
              </div>
              {metrics?.recentUploads.length ? (
                metrics.recentUploads.map((document) => (
                  <div key={document.id} className="doc-card">
                    <Link href={`/documents/${document.id}`} style={{ fontWeight: 700 }}>
                      {document.originalName}
                    </Link>
                    <p className="muted">{document.summary}</p>
                  </div>
                ))
              ) : (
                <p className="muted">No documents uploaded yet.</p>
              )}
            </div>

            <div className="panel stack">
              <h2 style={{ margin: 0 }}>Helpful next step</h2>
              <p className="muted">
                Open the AI Insights page to ask questions about one or more uploaded documents and export a combined report.
              </p>
              <Link href="/insights" className="button">
                Go to AI Insights
              </Link>
            </div>
          </section>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
