import type { Request, Response } from "express";
import { authService } from "../services/authService.js";

export class AuthController {
  async register(request: Request, response: Response) {
    const { name, email, password } = request.body as { name?: string; email?: string; password?: string };

    if (!name || !email || !password) {
      response.status(400).json({ message: "Name, email, and password are required." });
      return;
    }

    const auth = await authService.register(name, email, password);
    response.status(201).json(auth);
  }

  async login(request: Request, response: Response) {
    const { email, password } = request.body as { email?: string; password?: string };

    if (!email || !password) {
      response.status(400).json({ message: "Email and password are required." });
      return;
    }

    const auth = await authService.login(email, password);
    response.json(auth);
  }

  async me(request: Request, response: Response) {
    response.json({
      user: request.auth
    });
  }
}

export const authController = new AuthController();
