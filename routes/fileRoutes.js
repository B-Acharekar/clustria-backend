import express from "express";
import multer from "multer";
import { uploadFile, uploadFileAI, getFiles, listFiles, deleteFile, getStorageInfo } from "../controllers/fileController.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();
const upload = multer(); // memory storage

// Normal upload (no AI)
router.post("/upload", protect, upload.single("file"), uploadFile);

// AI-powered upload
router.post("/upload-ai", protect, upload.single("file"), uploadFileAI);

// List all files
router.get("/", protect, listFiles);

// Download
router.get("/:id/download", protect, getFiles);

// Delete
router.delete("/:id", protect, deleteFile);

// Storage info
router.get("/storage", protect, getStorageInfo);

export default router;
