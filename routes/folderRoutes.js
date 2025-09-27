import express from "express";
import {
  createFolder,
  getFolder,
  renameFolder,
  deleteFolder,
  getFolderPath,
  getAllFoldersForSidebar,
} from "../controllers/folderController.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/", protect, createFolder);
router.get("/", protect, getFolder);       // root folder
router.get("/:id", protect, getFolder);    // folder by id
router.get("/path/:id",protect, getFolderPath);
router.get("/",protect, getAllFoldersForSidebar);
router.get("/id",protect, getAllFoldersForSidebar);
router.put("/:id", protect, renameFolder);
router.delete("/:id", protect, deleteFolder);

export default router;
