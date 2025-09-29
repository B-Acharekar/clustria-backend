import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null }, // 📂 added
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true },
  encryptionType: { type: String, enum: ["NONE", "AES", "ZKE"], default: "NONE" },
  tags: { type: [String], default: [] },
  starred: { type: Boolean, default: false },
  lastAccessed: { type: Date, default: Date.now },
  metadata: { type: Object, default: {} },
  key: String,
  iv: String,
}, { timestamps: true });


export default mongoose.model("File", fileSchema);
