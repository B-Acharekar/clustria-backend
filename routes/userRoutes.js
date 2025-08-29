import express from "express";
import { signup, login, googleAuth } from "../controllers/authController.js";

const router = express.Router();

// Local auth
router.post("/signup", signup);
router.post("/login", login);

// Google auth (callback after OAuth)
router.post("/google", googleAuth);

export default router;
