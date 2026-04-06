import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboardService.js";

export class DashboardController {
  async get(request: Request, response: Response) {
    const metrics = await dashboardService.getMetrics(request.auth!.userId);
    response.json(metrics);
  }
}

export const dashboardController = new DashboardController();
