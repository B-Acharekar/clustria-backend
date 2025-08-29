import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true },
  encryptionType: { type: String, enum: ["NONE", "AES", "ZKE"], default: "NONE" },
  key: String,
  iv: String,
//   tags: { type: [String], default: [] },
//   metadata: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.model("File", fileSchema);
