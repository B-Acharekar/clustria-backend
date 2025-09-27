// routes/securityRoute.js
import express from "express";
import { getSecurityOverview } from "../controllers/securityController.js";
import { protect } from "../middlewares/authMiddlewares.js"; // make sure you have auth middleware

const router = express.Router();

// GET /api/security/overview
router.get("/overview", protect, getSecurityOverview);

export default router;
