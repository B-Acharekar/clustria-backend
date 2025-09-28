import express from "express";
import {
  listTrash,
  restoreItem,
  permanentlyDeleteItem,
  emptyTrash,
  getTrashItem,
} from "../controllers/trashController.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();


router.get("/",protect, listTrash); // GET /api/trash
router.get("/:id",protect, getTrashItem);   // ✅ added
router.post("/:id/restore",protect, restoreItem); // POST /api/trash/:id/restore
router.delete("/:id", protect,permanentlyDeleteItem); // DELETE /api/trash/:id
router.delete("/", protect,emptyTrash); // DELETE /api/trash

export default router;
