import { error } from "console";
import File from "../models/File.js";
import { uploadToAzure, downloadFromAzure  } from "../utils/azureUpload.js";
import crypto from "crypto";

export const uploadFile = async (req, res) => {
  try {
    const { encryptionType, folderId } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    let buffer = file.buffer;
    let key, iv;

    if (encryptionType === "AES") {
      key = crypto.randomBytes(32);
      iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      buffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
    }

    const fileUrl = await uploadToAzure(file.originalname, buffer);

    const newFile = await File.create({
      user: req.user._id, // associate with logged-in user
      folder:folderId || null,
      filename: file.originalname,
      fileUrl,
      encryptionType: encryptionType || "NONE",
      key: key?.toString("hex") || null,
      iv: iv?.toString("hex") || null,
    });

    res.status(201).json({ success: true, file: newFile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "File upload failed" });
  }
};

export const listFiles = async (req, res) => {
  try {
    const {folderId} = req.query;
    const query = {user: req.user._id};
    
    if(folderId) query.folder = folderId;

    const files = await File.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list files" });
  }
};

export const getFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { preview } = req.query;
    const fileDoc = await File.findById(id);

    if (!fileDoc) return res.status(404).json({ error: "File not found" });
    if (!fileDoc.user.equals(req.user._id)) return res.status(403).json({ error: "Unauthorized" });

    let buffer = await downloadFromAzure(fileDoc.filename);

    if (fileDoc.encryptionType === "AES" && fileDoc.key && fileDoc.iv) {
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(fileDoc.key, "hex"),
        Buffer.from(fileDoc.iv, "hex")
      );
      buffer = Buffer.concat([decipher.update(buffer), decipher.final()]);
    }
    
    // Determine MIME type
    const ext = fileDoc.filename.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream"; // fallback
    if (["png", "jpg", "jpeg", "gif"].includes(ext)) contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;
    if (ext === "pdf") contentType = "application/pdf";
    if (["mp4", "webm"].includes(ext)) contentType = `video/${ext}`;

    res.setHeader("Content-Type", contentType);

    // Only force download if preview not requested
    if (!preview) {
      res.setHeader("Content-Disposition", `attachment; filename=${fileDoc.filename}`);
    }
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};
