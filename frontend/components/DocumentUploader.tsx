"use client";

import { useState } from "react";
import { uploadDocuments } from "../lib/api";
import type { DocumentRecord } from "../lib/types";

export function DocumentUploader({ onUploaded }: { onUploaded: (documents: DocumentRecord[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (files.length === 0) {
      setError("Choose at least one PDF file.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await uploadDocuments(files, setProgress);
      onUploaded(response.documents);
      setFiles([]);
      setProgress(100);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }

  return (
    <div className="panel stack">
      <div className="row">
        <div>
          <h3 style={{ margin: 0 }}>Upload PDFs</h3>
          <p className="muted">Supports multi-file uploads with progress tracking.</p>
        </div>
        <button className="button" onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload documents"}
        </button>
      </div>
      <input
        className="input"
        type="file"
        accept="application/pdf"
        multiple
        onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
      />
      {files.length > 0 ? <span className="muted">{files.length} file(s) selected</span> : null}
      {progress > 0 ? (
        <div className="progress">
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      {error ? <span style={{ color: "var(--danger)" }}>{error}</span> : null}
    </div>
  );
}
