import OpenAI from "openai";
import { env } from "../config/env.js";

export interface InsightPayload {
  summary: string;
  keyPoints: string[];
  importantSections: string[];
  keySentences: string[];
  model: string;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function extractKeywords(text: string) {
  const stopWords = new Set([
    "the", "and", "for", "that", "with", "this", "from", "have", "your", "into", "their", "they", "them", "will",
    "then", "than", "been", "were", "which", "what", "when", "where", "about", "after", "before", "there", "here",
    "such", "could", "would", "should", "also", "only", "just", "very", "much", "more", "most", "document", "documents"
  ]);

  const counts = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[a-z]{4,}/g) ?? []) {
    if (stopWords.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);
}

function buildLocalInsight(text: string): InsightPayload {
  const sentences = splitSentences(text);
  const keywords = extractKeywords(text);
  const chosenSentences = sentences.slice(0, 6);
  const summary = chosenSentences
    .slice(0, 5)
    .map((sentence) => `- ${sentence}`)
    .join("\n");

  return {
    summary: summary || "- No clear text could be summarized from this document.",
    keyPoints: chosenSentences.slice(0, 5).map((sentence) => sentence.replace(/\s+/g, " ").trim()),
    importantSections: keywords.length ? keywords.map((keyword) => keyword[0].toUpperCase() + keyword.slice(1)) : ["Overview"],
    keySentences: chosenSentences.slice(0, 3),
    model: "local-fallback"
  };
}

function buildLocalAnswer(context: string, question: string) {
  const sentences = splitSentences(context);
  const terms = question.toLowerCase().match(/[a-z]{4,}/g) ?? [];
  const matches = sentences
    .map((sentence) => ({
      sentence,
      score: terms.reduce((total, term) => total + (sentence.toLowerCase().includes(term) ? 1 : 0), 0)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.sentence);

  if (matches.length === 0) {
    return "I could not find a strong exact match in the uploaded documents, but the extracted text is available on the Documents page for manual review.";
  }

  return [
    "Based on the uploaded documents:",
    ...matches.map((sentence) => `- ${sentence}`)
  ].join("\n");
}

export class AiService {
  readonly model = "gpt-4.1-mini";
  private client = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null;

  async summarize(text: string): Promise<InsightPayload> {
    if (!this.client) {
      return buildLocalInsight(text);
    }

    try {
      const client = this.getClient();
      const response = await client.responses.create({
        model: this.model,
        input: [
          {
            role: "system",
            content:
              "You are an expert document analyst. Return concise JSON with a short readable summary, keyPoints, importantSections, and keySentences. Keep the summary clear for a student reader."
          },
          {
            role: "user",
            content:
              `Analyze this document and respond with JSON only.\n` +
              `Requirements:\n` +
              `- summary: 5 to 10 short lines worth of content, easy to read, not dense\n` +
              `- keyPoints: 4 to 6 bullet-style points\n` +
              `- importantSections: short section labels\n` +
              `- keySentences: 3 exact or near-exact sentences from the document\n\n` +
              `${text.slice(0, 18000)}`
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "document_insights",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: { type: "string" },
                keyPoints: { type: "array", items: { type: "string" } },
                importantSections: { type: "array", items: { type: "string" } },
                keySentences: { type: "array", items: { type: "string" } }
              },
              required: ["summary", "keyPoints", "importantSections", "keySentences"]
            }
          }
        }
      });

      const parsed = JSON.parse(response.output_text) as Omit<InsightPayload, "model">;
      return {
        ...parsed,
        model: this.model
      };
    } catch (error) {
      return buildLocalInsight(text);
    }
  }

  async answerQuestion(context: string, question: string, history: Array<{ role: "user" | "assistant"; content: string }>) {
    if (!this.client) {
      return buildLocalAnswer(context, question);
    }

    try {
      const client = this.getClient();
      const response = await client.responses.create({
        model: this.model,
        input: [
          {
            role: "system",
            content:
              "You answer questions about uploaded documents. Only use the provided document context. Keep answers clear, direct, and well spaced."
          },
          ...history.map((message) => ({
            role: message.role,
            content: message.content
          })),
          {
            role: "user",
            content: `Document context:\n${context.slice(0, 22000)}\n\nQuestion:\n${question}`
          }
        ]
      });

      return response.output_text.trim();
    } catch (error) {
      return buildLocalAnswer(context, question);
    }
  }

  async compareDocuments(texts: string[]): Promise<string> {
    const insight = await this.summarize(texts.join("\n\n"));
    return insight.summary;
  }

  private ensureConfigured() {
    if (!this.client) {
      throw new Error("AI service is unavailable. Ensure OPENAI_API_KEY is properly set in .env and loaded by the backend.");
    }
  }

  private getClient() {
    this.ensureConfigured();
    return this.client as OpenAI;
  }
}

export const aiService = new AiService();
