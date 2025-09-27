// controllers/authController.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../utils/mailer.js";
import { resetPasswordTemplate } from "../utils/emailTemplates.js";
import { createDefaultFolders } from "./folderController.js";

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const setTokenCookie = (res,token) => {
  res.cookie("token",token,{
    httpOnly:true,
    secure:process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7*24*60*60*1000, //7 days
  });
}

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    await createDefaultFolders(user._id);

    const token = generateToken(user);
    setTokenCookie(res,token);

    res.json({ success: true, user}); //no token in JSON
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user);
    setTokenCookie(res,token);
    res.json({ success: true, user }); // no token in JSON
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body; // frontend sends the Google ID token

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        provider: "google",
      });
      isNewUser = true;
    }

    if (isNewUser) {
      await createDefaultFolders(user._id);
    }

    // Issue our JWT
    const appToken = generateToken(user);
    setTokenCookie(res,appToken);
    res.json({ success: true, user});
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Google authentication failed" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ success: true });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_PORT}/reset-password/${token}`;
    const emailContent = resetPasswordTemplate(user.name, resetLink);
    await sendEmail(
      user.email,
      "Password Reset Request",
      emailContent
    );

    res.json({ success: true, msg: "Password reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to send email" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    // Update password
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, msg: "Password has been reset successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user || !user.password)
      return res.status(400).json({ msg: "Invalid request" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, msg: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
