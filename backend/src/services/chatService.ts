import { v4 as uuidv4 } from "uuid";
import type { ChatMessage } from "../models/types.js";

class ChatService {
  private sessions = new Map<string, ChatMessage[]>();

  getHistory(sessionId: string) {
    return this.sessions.get(sessionId) ?? [];
  }

  append(sessionId: string, role: "user" | "assistant", content: string) {
    const current = this.getHistory(sessionId);
    const next: ChatMessage = {
      id: uuidv4(),
      role,
      content,
      createdAt: new Date().toISOString()
    };
    const updated = [...current, next].slice(-12);
    this.sessions.set(sessionId, updated);
    return updated;
  }
}

export const chatService = new ChatService();
