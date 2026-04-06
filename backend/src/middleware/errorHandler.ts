import type { NextFunction, Request, Response } from "express";

export function errorHandler(error: Error, _request: Request, response: Response, _next: NextFunction) {
  const message = error.message || "Something went wrong.";
  const statusCode = message.includes("AI service is unavailable")
    ? 503
    : message.includes("Failed to extract text") || message.includes("does not contain enough selectable text")
      ? 422
      : 400;

  response.status(statusCode).json({
    message
  });
}
