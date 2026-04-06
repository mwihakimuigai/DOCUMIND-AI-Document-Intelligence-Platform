import { Router } from "express";
import { reportController } from "../controllers/reportController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.post("/text", asyncHandler((request, response) => reportController.exportText(request, response)));
router.post("/pdf", asyncHandler((request, response) => reportController.exportPdf(request, response)));

export default router;
