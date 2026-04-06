import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler((request, response) => authController.register(request, response)));
router.post("/login", asyncHandler((request, response) => authController.login(request, response)));
router.get("/me", requireAuth, asyncHandler((request, response) => authController.me(request, response)));

export default router;
