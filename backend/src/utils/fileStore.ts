import fs from "node:fs/promises";
import path from "node:path";
import { createSeedStore } from "../data/demo.js";
import type { DocumentRecord, StoreShape } from "../models/types.js";

const dataPath = path.resolve(process.cwd(), "src", "data", "store.json");

async function ensureStoreFile(): Promise<void> {
  try {
    await fs.access(dataPath);
  } catch {
    const seed = await createSeedStore();
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify(seed, null, 2), "utf8");
  }
}

export async function readStore(): Promise<StoreShape> {
  await ensureStoreFile();
  const raw = await fs.readFile(dataPath, "utf8");
  const store = JSON.parse(raw) as StoreShape;

  return {
    ...store,
    documents: store.documents.map(normalizeDocument)
  };
}

export async function writeStore(store: StoreShape): Promise<void> {
  await fs.writeFile(dataPath, JSON.stringify(store, null, 2), "utf8");
}

function normalizeDocument(document: DocumentRecord): DocumentRecord {
  return {
    ...document,
    keyPoints: document.keyPoints ?? [],
    importantSections: document.importantSections ?? [],
    keySentences: document.keySentences ?? [],
    tags: document.tags ?? [],
    viewCount: document.viewCount ?? 0,
    processedAt: document.processedAt ?? document.uploadDate,
    aiModel: document.aiModel ?? "unknown"
  };
}
