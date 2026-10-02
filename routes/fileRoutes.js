import express from "express";
import multer from "multer";
import { uploadFile, uploadFileAI, getFiles, getSharedFile, downloadSharedFile, listFiles, deleteFile, getStorageInfo, renameFile, shareFile, toggleStarFile, getStarredFiles, getRecentFiles, getFileMetadata } from "../controllers/fileController.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Normal upload (no AI)
router.post("/upload", protect, upload.single("file"), uploadFile);

// AI-powered upload
router.post("/upload-ai", protect, upload.single("file"), uploadFileAI);

// List all files
router.get("/", protect, listFiles);

// Storage info
router.get("/storage", protect, getStorageInfo);

// Public, expiring share links. These routes intentionally do not use protect.
router.get("/shared/:token", getSharedFile);
router.get("/shared/:token/download", downloadSharedFile);

// Download
router.get("/:id/download", protect, getFiles);


router.patch("/:id/rename", protect, renameFile);
router.post("/:id/share", protect, shareFile);


router.patch("/:id/star", protect, toggleStarFile);
router.get("/starred", protect, getStarredFiles);
router.get("/recent", protect, getRecentFiles);
// Delete
router.delete("/:id", protect, deleteFile);
router.get("/:id", protect, getFileMetadata); // metadata route

export default router;
