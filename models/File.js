import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null }, // 📂 added
  filename: { type: String, required: true },
  blobName: { type: String },
  fileUrl: { type: String, required: true },
  encryptionType: { type: String, enum: ["NONE", "AES", "ZKE"], default: "NONE" },
  tags: { type: [String], default: [] },
  starred: { type: Boolean, default: false },
  lastAccessed: { type: Date, default: Date.now },
  metadata: { type: Object, default: {} },
  key: String,
  iv: String,
  // Only the hash is persisted; the raw share token is sent to the recipient once.
  shareTokenHash: { type: String, select: false, index: true },
  shareExpiresAt: { type: Date, index: true },
}, { timestamps: true });


export default mongoose.model("File", fileSchema);
