"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/Shell";
import { DocumentList } from "../../components/DocumentList";
import { DocumentUploader } from "../../components/DocumentUploader";
import { ProtectedPage } from "../../components/ProtectedPage";
import { deleteDocument, getDocuments } from "../../lib/api";
import type { DocumentRecord } from "../../lib/types";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [activeDocument, setActiveDocument] = useState<DocumentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getDocuments();
        setDocuments(response.documents);
        setActiveDocument(response.documents[0] ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load documents.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ProtectedPage>
      <AppShell>
        <div className="grid">
          <DocumentUploader
            onUploaded={(newDocuments) => {
              const updated = [...newDocuments, ...documents];
              setDocuments(updated);
              setActiveDocument(updated[0] ?? null);
            }}
          />

          {error ? <div className="panel status-error">{error}</div> : null}

          <div className="two-col">
            <div className="panel stack">
              <div className="row">
                <h2 style={{ margin: 0 }}>All documents</h2>
                <span className="pill">{documents.length} files</span>
              </div>
              {loading ? <p className="muted">Loading documents...</p> : null}
              {!loading && documents.length === 0 ? (
                <p className="muted">No documents uploaded yet. Add a PDF to start extraction and AI summarization.</p>
              ) : null}
              <DocumentList
                documents={documents}
                onDeleted={async (id) => {
                  await deleteDocument(id);
                  const updated = documents.filter((document) => document.id !== id);
                  setDocuments(updated);
                  if (activeDocument?.id === id) {
                    setActiveDocument(updated[0] ?? null);
                  }
                }}
                onSelected={setActiveDocument}
              />
            </div>

            <div className="panel stack">
              <h2 style={{ margin: 0 }}>Selected document preview</h2>
              {activeDocument ? (
                <>
                  <strong>{activeDocument.originalName}</strong>
                  <div className="muted">
                    Processed {new Date(activeDocument.processedAt).toLocaleString()} | {activeDocument.viewCount} views
                  </div>
                  <div className="stack">
                    <span className="pill">AI summary</span>
                    <p className="summary-block">{activeDocument.summary}</p>
                  </div>
                  <div className="stack">
                    <span className="pill">Key points</span>
                    <ul className="bullet-list">
                      {activeDocument.keyPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="muted">Select a document to preview its summary and extracted text.</p>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
