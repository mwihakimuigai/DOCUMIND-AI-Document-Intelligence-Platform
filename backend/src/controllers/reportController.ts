import type { Request, Response } from "express";
import { reportService } from "../services/reportService.js";

export class ReportController {
  async exportText(request: Request, response: Response) {
    const title = String(request.body.title ?? "DocuMind Intelligence Report");
    const documentIds = Array.isArray(request.body.documentIds) ? (request.body.documentIds as string[]) : undefined;
    const report = await reportService.buildReport(request.auth!.userId, title, documentIds);

    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.setHeader("Content-Disposition", "attachment; filename=documind-report.txt");
    response.send(reportService.toText(report));
  }

  async exportPdf(request: Request, response: Response) {
    const title = String(request.body.title ?? "DocuMind Intelligence Report");
    const documentIds = Array.isArray(request.body.documentIds) ? (request.body.documentIds as string[]) : undefined;
    const report = await reportService.buildReport(request.auth!.userId, title, documentIds);
    const pdf = await reportService.toPdf(report);

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", "attachment; filename=documind-report.pdf");
    response.send(pdf);
  }
}

export const reportController = new ReportController();
