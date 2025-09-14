import express from "express";
import multer from "multer";
import { uploadFile, getFiles, listFiles, deleteFile, getStorageInfo } from "../controllers/fileController.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();
const upload = multer(); // memory storage

// Upload file (authenticated)
router.post("/upload", protect, upload.single("file"), uploadFile);

// List all files of the logged-in user
router.get("/", protect, listFiles);

// Download specific file by id (authenticated & ownership check inside controller)
router.get("/:id/download", protect, getFiles);

// Delete file by id
router.delete("/:id", protect, deleteFile);

router.get("/storage", protect, getStorageInfo);

export default router;
