import { readStore, writeStore } from "../utils/fileStore.js";
import type { DocumentRecord, StoreShape, UserRecord } from "../models/types.js";

export class StorageService {
  async getStore(): Promise<StoreShape> {
    return readStore();
  }

  async saveStore(store: StoreShape): Promise<void> {
    await writeStore(store);
  }

  async listUsers(): Promise<UserRecord[]> {
    const store = await this.getStore();
    return store.users;
  }

  async listDocuments(): Promise<DocumentRecord[]> {
    const store = await this.getStore();
    return store.documents;
  }
}

export const storageService = new StorageService();
