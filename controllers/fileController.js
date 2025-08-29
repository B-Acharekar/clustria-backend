import File from "../models/File.js";
import { uploadToAzure } from "../utils/azureUpload.js";
import crypto from "crypto";

export const uploadFile = async (req, res) => {
  try {
    const { encryptionType } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    let buffer = file.buffer;

    if (encryptionType === "AES") {
      const key = crypto.randomBytes(32); // AES-256 key
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      buffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
    }

    const fileUrl = await uploadToAzure(file.originalname, buffer);

    const newFile = await File.create({
      filename: file.originalname,
      fileUrl,
      encryptionType: encryptionType || "NONE",
    });

    res.status(201).json({ success: true, file: newFile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "File upload failed" });
  }
};

export const getFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};
