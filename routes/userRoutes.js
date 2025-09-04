import express from "express";
import { signup, login, googleAuth, logout } from "../controllers/authController.js";

const router = express.Router();

// Local auth
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout",logout);

// Google auth (callback after OAuth)
router.post("/google", googleAuth);

export default router;
