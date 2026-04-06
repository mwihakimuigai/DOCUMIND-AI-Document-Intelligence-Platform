import { Router } from "express";
import { searchController } from "../controllers/searchController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler((request, response) => searchController.query(request, response)));

export default router;
