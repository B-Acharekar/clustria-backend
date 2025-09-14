// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // only for custom login (hashed)
  provider: { type: String, enum: ["local", "google"], default: "local" },
  googleId: { type: String }, // for Google OAuth users
  avatar: { type: String }, // profile picture
  storageUsed: { type: Number, default: 0 }, // in bytes
  storageLimit: { type: Number, default: 5 * 1024 * 1024 * 1024 }, // default 5GB
  googleRefreshToken: { type: String }, // new field for Gmail API
  resetPasswordToken : {type: String},
  resetPasswordExpires : {type:Date},
}, { timestamps: true });

export default mongoose.model("User", userSchema);
