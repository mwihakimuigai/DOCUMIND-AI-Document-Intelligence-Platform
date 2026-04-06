import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env.js";
import { storageService } from "./storageService.js";
import type { UserRecord } from "../models/types.js";

function sanitizeUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

export class AuthService {
  async register(name: string, email: string, password: string) {
    const store = await storageService.getStore();
    const existingUser = store.users.find((user) => user.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      throw new Error("An account with that email already exists.");
    }

    const user: UserRecord = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString()
    };

    store.users.push(user);
    await storageService.saveStore(store);

    return this.createAuthResponse(user);
  }

  async login(email: string, password: string) {
    const store = await storageService.getStore();
    const user = store.users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new Error("Invalid email or password.");
    }

    return this.createAuthResponse(user);
  }

  verifyToken(token: string) {
    return jwt.verify(token, env.jwtSecret) as { sub: string; email: string };
  }

  private createAuthResponse(user: UserRecord) {
    const token = jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, { expiresIn: "7d" });

    return {
      token,
      user: sanitizeUser(user)
    };
  }
}

export const authService = new AuthService();
