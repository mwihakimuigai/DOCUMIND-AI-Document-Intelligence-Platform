"use client";

import Link from "next/link";
import { getDocumentFileUrl } from "../lib/api";
import type { DocumentRecord } from "../lib/types";

export function DocumentList({
  documents,
  onDeleted,
  onSelected
}: {
  documents: DocumentRecord[];
  onDeleted: (id: string) => Promise<void> | void;
  onSelected: (document: DocumentRecord) => void;
}) {
  return (
    <div className="stack">
      {documents.map((document) => (
        <div key={document.id} className="doc-card">
          <div className="row">
            <div>
              <Link href={`/documents/${document.id}`} style={{ fontWeight: 700 }}>
                {document.originalName}
              </Link>
              <div className="muted">
                Uploaded {new Date(document.uploadDate).toLocaleDateString()} | {document.tags.join(", ")}
              </div>
            </div>
            <div className="row">
              <a
                className="button secondary"
                href={getDocumentFileUrl(document.id)}
                target="_blank"
                rel="noreferrer"
              >
                View PDF
              </a>
              <button className="button secondary" onClick={() => onSelected(document)}>
                View text
              </button>
              <Link className="button secondary" href={`/documents/${document.id}?tab=summary`}>
                View AI summary
              </Link>
              <button className="button danger" onClick={() => void onDeleted(document.id)}>
                Delete
              </button>
            </div>
          </div>
          <p className="muted">{document.summary}</p>
        </div>
      ))}
    </div>
  );
}
