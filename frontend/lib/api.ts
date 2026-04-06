import type { ChatMessage, DashboardMetrics, DocumentRecord, SearchResult, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type HttpMethod = "GET" | "POST" | "DELETE";

function getToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem("documind_token") ?? "";
}

export function saveSession(token: string, user: User) {
  window.localStorage.setItem("documind_token", token);
  window.localStorage.setItem("documind_user", JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem("documind_token");
  window.localStorage.removeItem("documind_user");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem("documind_user");
  return raw ? (JSON.parse(raw) as User) : null;
}

export function getDocumentFileUrl(id: string) {
  return `${API_URL}/documents/${id}/file?token=${encodeURIComponent(getToken())}`;
}

async function request<T>(path: string, method: HttpMethod = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: "Request failed." }))) as { message?: string };
    throw new Error(error.message ?? "Request failed.");
  }

  return (await response.json()) as T;
}

export async function register(payload: { name: string; email: string; password: string }) {
  return request<{ token: string; user: User }>("/auth/register", "POST", payload);
}

export async function login(payload: { email: string; password: string }) {
  return request<{ token: string; user: User }>("/auth/login", "POST", payload);
}

export async function getDocuments() {
  return request<{ documents: DocumentRecord[] }>("/documents");
}

export async function getDocument(id: string) {
  return request<{ document: DocumentRecord }>(`/documents/${id}`);
}

export async function deleteDocument(id: string) {
  return request<{ document: DocumentRecord }>(`/documents/${id}`, "DELETE");
}

export async function getDashboardMetrics() {
  return request<DashboardMetrics>("/dashboard");
}

export async function fetchCombinedInsights(documentIds?: string[]) {
  return request<{
    documentCount: number;
    summary: string;
    keyPoints: string[];
    importantSections: string[];
    model: string;
  }>("/insights/combined", "POST", { documentIds });
}

export async function chatWithDocuments(question: string, sessionId: string, documentIds?: string[]) {
  return request<{ answer: string; history: ChatMessage[] }>("/insights/chat", "POST", { question, sessionId, documentIds });
}

export async function compareDocuments(documentIds: string[]) {
  return request<{ comparison: string }>("/insights/compare", "POST", { documentIds });
}

export async function searchDocuments(query: string) {
  return request<{ query: string; results: SearchResult[] }>(`/search?q=${encodeURIComponent(query)}`);
}

export async function downloadReport(format: "text" | "pdf", payload: { title: string; documentIds?: string[] }) {
  const response = await fetch(`${API_URL}/reports/${format}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to export report.");
  }

  return response.blob();
}

export async function uploadDocuments(
  files: File[],
  onProgress: (progress: number) => void
): Promise<{ documents: DocumentRecord[] }> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/documents/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as { documents: DocumentRecord[] });
        return;
      }
      try {
        const payload = JSON.parse(xhr.responseText) as { message?: string };
        reject(new Error(payload.message ?? "Upload failed."));
      } catch {
        reject(new Error("Upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed."));
    xhr.send(formData);
  });
}
