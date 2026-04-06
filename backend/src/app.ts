import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "DocuMind API"
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/documents", documentRoutes);
  app.use("/api/insights", insightRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/reports", reportRoutes);

  app.use(errorHandler);

  return app;
}
