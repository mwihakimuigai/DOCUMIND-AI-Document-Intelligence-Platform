import type { Request, Response } from "express";
import path from "node:path";
import { documentService } from "../services/documentService.js";

export class DocumentController {
  async list(request: Request, response: Response) {
    const documents = await documentService.listByUser(request.auth!.userId);
    response.json({ documents });
  }

  async upload(request: Request, response: Response) {
    const files = (request.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
      response.status(400).json({ message: "At least one PDF file is required." });
      return;
    }

    const documents = await documentService.createMany(request.auth!.userId, files);
    response.status(201).json({ documents });
  }

  async get(request: Request, response: Response) {
    const document = await documentService.getById(request.auth!.userId, String(request.params.id));
    response.json({ document });
  }

  async remove(request: Request, response: Response) {
    const document = await documentService.remove(request.auth!.userId, String(request.params.id));
    response.json({ document });
  }

  async viewFile(request: Request, response: Response) {
    const document = await documentService.getById(request.auth!.userId, String(request.params.id));
    const filePath = path.resolve(process.cwd(), "uploads", document.filename);
    response.sendFile(filePath, (error) => {
      if (error) {
        response.status(404).json({
          message: "Original file is unavailable for this document. Demo seed records only include extracted content."
        });
      }
    });
  }
}

export const documentController = new DocumentController();
