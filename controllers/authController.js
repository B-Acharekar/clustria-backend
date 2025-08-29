// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = generateToken(user);
    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, avatar } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, googleId, avatar, provider: "google" });
    }

    const token = generateToken(user);
    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
