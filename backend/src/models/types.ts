export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  mimeType: string;
  fileSize: number;
  extractedText: string;
  summary: string;
  keyPoints: string[];
  importantSections: string[];
  keySentences: string[];
  tags: string[];
  viewCount: number;
  processedAt: string;
  aiModel: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalDocuments: number;
  latestAiSummary: {
    documentId: string;
    documentName: string;
    summary: string;
    processedAt: string;
  } | null;
  topKeywords: string[];
  mostActiveDocument: {
    documentId: string;
    documentName: string;
    viewCount: number;
    summary: string;
  } | null;
  recentUploads: DocumentRecord[];
}

export interface SearchResult {
  documentId: string;
  filename: string;
  snippet: string;
  score: number;
}

export interface ReportRecord {
  title: string;
  generatedAt: string;
  summary: string;
  keyInsights: string[];
  tableOfContents: string[];
  documentIds: string[];
}

export interface StoreShape {
  users: UserRecord[];
  documents: DocumentRecord[];
}
