import path from "node:path";
import multer from "multer";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { documentController } from "../controllers/documentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(process.cwd(), "uploads"),
    filename: (_request, file, callback) => {
      callback(null, `${uuidv4()}-${file.originalname}`);
    }
  }),
  fileFilter: (_request, file, callback) => {
    const isPdfMime = file.mimetype === "application/pdf";
    const hasPdfName = file.originalname.toLowerCase().endsWith(".pdf");
    callback(null, isPdfMime || hasPdfName);
  }
});

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler((request, response) => documentController.list(request, response)));
router.get("/:id/file", asyncHandler((request, response) => documentController.viewFile(request, response)));
router.get("/:id", asyncHandler((request, response) => documentController.get(request, response)));
router.post("/upload", upload.array("files", 10), asyncHandler((request, response) => documentController.upload(request, response)));
router.delete("/:id", asyncHandler((request, response) => documentController.remove(request, response)));

export default router;
