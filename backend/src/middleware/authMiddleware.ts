import type { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService.js";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
      };
    }
  }
}

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const rawHeader = request.headers.authorization;
  const tokenFromHeader = rawHeader?.startsWith("Bearer ") ? rawHeader.slice(7) : undefined;
  const tokenFromQuery = typeof request.query.token === "string" ? request.query.token : undefined;
  const token = tokenFromHeader ?? tokenFromQuery;

  if (!token) {
    response.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const decoded = authService.verifyToken(token);
    request.auth = {
      userId: decoded.sub,
      email: decoded.email
    };
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token." });
  }
}
