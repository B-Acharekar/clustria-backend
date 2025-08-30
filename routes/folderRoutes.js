import express from "express";
import {
  createFolder,
  getFolder,
  renameFolder,
  deleteFolder,
} from "../controllers/folderController.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/", protect, createFolder);
router.get("/", protect, getFolder);       // root folder
router.get("/:id", protect, getFolder);    // folder by id
router.put("/:id", protect, renameFolder);
router.delete("/:id", protect, deleteFolder);

export default router;
