import bcrypt from "bcryptjs";
import type { StoreShape } from "../models/types.js";

const demoTextOne = `DocuMind demo proposal. The platform processes uploaded contracts, reports, and research documents. It extracts the most important themes, highlights risk areas, and generates concise executive summaries. Teams can search across multiple files and compare trends between documents. This proposal recommends a phased rollout with audit logging, AI insights, and workspace collaboration.`;

const demoTextTwo = `Quarterly operations review. Customer support resolution time improved by 18 percent after automation. Key concerns remain around vendor renewals, document review cycles, and onboarding delays. The report recommends investing in document intelligence tooling to speed up analysis and knowledge retrieval. Projected ROI is expected within two quarters if adoption remains above 70 percent.`;

export async function createSeedStore(): Promise<StoreShape> {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  return {
    users: [
      {
        id: "user-demo-1",
        name: "Demo Analyst",
        email: "demo@documind.ai",
        passwordHash,
        createdAt: new Date().toISOString()
      }
    ],
    documents: [
      {
        id: "doc-demo-1",
        userId: "user-demo-1",
        filename: "proposal-overview.pdf",
        originalName: "proposal-overview.pdf",
        uploadDate: new Date().toISOString(),
        mimeType: "application/pdf",
        fileSize: 154320,
        extractedText: demoTextOne,
        summary: "A rollout proposal focused on AI-assisted document processing, risk detection, and searchable summaries.",
        keyPoints: [
          "Phased rollout for document intelligence",
          "Executive summaries for fast review",
          "Risk area identification and cross-document search"
        ],
        importantSections: [
          "Platform purpose",
          "Rollout strategy",
          "Collaboration benefits"
        ],
        keySentences: [
          "The platform processes uploaded contracts, reports, and research documents.",
          "It extracts the most important themes, highlights risk areas, and generates concise executive summaries.",
          "Teams can search across multiple files and compare trends between documents."
        ],
        tags: [
          "proposal",
          "ai",
          "operations"
        ],
        viewCount: 2,
        processedAt: new Date().toISOString(),
        aiModel: "seed-demo"
      },
      {
        id: "doc-demo-2",
        userId: "user-demo-1",
        filename: "q1-operations-review.pdf",
        originalName: "q1-operations-review.pdf",
        uploadDate: new Date().toISOString(),
        mimeType: "application/pdf",
        fileSize: 221003,
        extractedText: demoTextTwo,
        summary: "An operations review showing faster support performance, vendor risks, and a strong case for document intelligence ROI.",
        keyPoints: [
          "Support resolution improved by 18 percent",
          "Renewals and onboarding remain key friction points",
          "Document intelligence investment shows near-term ROI"
        ],
        importantSections: [
          "Operational gains",
          "Outstanding risks",
          "ROI forecast"
        ],
        keySentences: [
          "Customer support resolution time improved by 18 percent after automation.",
          "Key concerns remain around vendor renewals, document review cycles, and onboarding delays.",
          "Projected ROI is expected within two quarters if adoption remains above 70 percent."
        ],
        tags: [
          "review",
          "operations",
          "roi"
        ],
        viewCount: 4,
        processedAt: new Date().toISOString(),
        aiModel: "seed-demo"
      }
    ]
  };
}
