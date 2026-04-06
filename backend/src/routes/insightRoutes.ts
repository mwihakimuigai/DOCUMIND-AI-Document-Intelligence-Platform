import { Router } from "express";
import { insightsController } from "../controllers/insightsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.post("/combined", asyncHandler((request, response) => insightsController.combined(request, response)));
router.post("/chat", asyncHandler((request, response) => insightsController.chat(request, response)));
router.post("/compare", asyncHandler((request, response) => insightsController.compare(request, response)));

export default router;
