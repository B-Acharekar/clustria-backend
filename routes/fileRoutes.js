import express from "express";
import multer from "multer";
import { uploadFile, getFiles } from "../controllers/fileController.js";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/upload", upload.single("file"), uploadFile);
router.get("/", getFiles);

export default router;
