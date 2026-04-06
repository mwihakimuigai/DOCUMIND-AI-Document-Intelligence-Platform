import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler((request, response) => dashboardController.get(request, response)));

export default router;
