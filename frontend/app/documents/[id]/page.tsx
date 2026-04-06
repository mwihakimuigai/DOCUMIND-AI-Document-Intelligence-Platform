"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "../../../components/Shell";
import { ProtectedPage } from "../../../components/ProtectedPage";
import { getDocument, getDocumentFileUrl } from "../../../lib/api";
import type { DocumentRecord } from "../../../lib/types";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "text";
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getDocument(String(params.id));
        setDocument(response.document);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load document details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  return (
    <ProtectedPage>
      <AppShell>
        <div className="grid">
          <div className="panel stack">
            <div className="row">
              <div>
                <h1 style={{ margin: 0 }}>{document?.originalName ?? "Document details"}</h1>
                {document ? (
                  <div className="muted">
                    Uploaded {new Date(document.uploadDate).toLocaleString()} | {document.viewCount} views
                  </div>
                ) : null}
              </div>
              <div className="row">
                {document ? (
                  <a className="button secondary" href={getDocumentFileUrl(document.id)} target="_blank" rel="noreferrer">
                    Open PDF
                  </a>
                ) : null}
                <Link className="button secondary" href="/documents">
                  Back
                </Link>
              </div>
            </div>

            {error ? <div className="status-error">{error}</div> : null}
            {loading ? <p className="muted">Loading document details...</p> : null}
            {document ? (
              <>
                <div className="tab-row">
                  <Link className={tab === "text" ? "pill active-pill" : "pill"} href={`/documents/${document.id}?tab=text`}>
                    Full extracted text
                  </Link>
                  <Link className={tab === "summary" ? "pill active-pill" : "pill"} href={`/documents/${document.id}?tab=summary`}>
                    AI summary
                  </Link>
                </div>

                {tab === "summary" ? (
                  <div className="stack">
                    <div>
                      <h2>Summary</h2>
                      <p className="summary-block">{document.summary}</p>
                    </div>
                    <div>
                      <h2>Key points</h2>
                      <ul className="bullet-list">
                        {document.keyPoints.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h2>Important sections</h2>
                      <div className="keyword-wrap">
                        {document.importantSections.map((section) => (
                          <span key={section} className="pill">
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="stack">
                    <div>
                      <h2>Key sentences</h2>
                      <div className="stack">
                        {document.keySentences.map((sentence) => (
                          <div key={sentence} className="doc-card">
                            {sentence}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h2>Extracted text</h2>
                      <textarea className="textarea" readOnly value={document.extractedText} />
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
