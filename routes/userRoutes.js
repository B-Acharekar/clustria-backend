import express from "express";
import { signup, login, logout, googleAuth, forgotPassword, resetPassword, getProfile, updateProfile, changePassword } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
