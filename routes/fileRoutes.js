import express from "express";
import multer from "multer";
import { uploadFile, getFiles, listFiles } from "../controllers/fileController.js";

const router = express.Router();
const upload = multer(); // memory storage

// Upload file
router.post("/upload", upload.single("file"), uploadFile);

// List all files (metadata only)
router.get("/", listFiles);

// Download specific file by id (with decryption if needed)
router.get("/:id/download", getFiles);

export default router;
