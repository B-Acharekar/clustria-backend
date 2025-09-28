import { error } from "console";
import File from "../models/File.js";
import Folder from "../models/Folder.js";
import Trash from "../models/Trash.js";
import { uploadToAzure, downloadFromAzure} from "../utils/azureUpload.js";
import crypto from "crypto";
import { classifyText } from "../utils/aiClient.js";
import { extractTextFromAzureBlob } from "../utils/extractText.js";

export const uploadFile = async (req, res) => {
  try {
    const { encryptionType, folderId, tags } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // 🔒 Encryption (if enabled)
    let buffer = file.buffer;
    let key, iv;
    if (encryptionType === "AES") {
      key = crypto.randomBytes(32);
      iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      buffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
    }

    // ☁️ Upload to Azure
    const fileUrl = await uploadToAzure(file.originalname, buffer);

    // 🏷 Tags parsing
    const parsedTags = tags ? tags.split(",").map(tag => tag.trim()) : [];

    // Save without AI
    const metadata = {
      size: file.size,
      type: file.mimetype,
      extension: file.originalname.split(".").pop().toLowerCase(),
    };

    const newFile = await File.create({
      user: req.user._id,
      folder: folderId || null,
      filename: file.originalname,
      fileUrl,
      encryptionType: encryptionType || "NONE",
      key: key?.toString("hex") || null,
      iv: iv?.toString("hex") || null,
      tags: parsedTags,
      metadata,
    });

    // Update user storage
    req.user.storageUsed += file.size;
    await req.user.save();

    res.status(201).json({ success: true, file: newFile });
  } catch (err) {
    console.error("Upload error:", err);
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

export const uploadFileAI = async (req, res) => {
  try {
    const { encryptionType, folderId, tags } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const ext = file.originalname.split(".").pop().toLowerCase();

    // 🔹 Extract text locally (Node) instead of sending file URL to Flask
    const text = await extractTextFromAzureBlob(file.buffer, ext);

    // 🧠 Classify with AI (text-based)
    const aiMeta = await classifyText(text);

    // 🔒 Encryption
    let buffer = file.buffer;
    let key, iv;
    if (encryptionType === "AES") {
      key = crypto.randomBytes(32);
      iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      buffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
    }

    // ☁️ Upload to Azure
    const fileUrl = await uploadToAzure(file.originalname, buffer);

    // 🏷 Tags parsing
    const parsedTags = tags ? tags.split(",").map(tag => tag.trim()) : [];

    // 📂 Auto-organize folder based on AI label
    let targetFolderId = folderId || null;
    let autoOrganizeMessage = null;

    if (!targetFolderId) {
      if (aiMeta.label && aiMeta.label !== "Unknown") {
        try {
          const folderName = aiMeta.label.replace(/_/g, " "); // normalize
          let folder = await Folder.findOne({ name: folderName, user: req.user._id });
          if (!folder) folder = await Folder.create({ name: folderName, user: req.user._id });
          targetFolderId = folder._id;
        } catch (err) {
          console.error("Auto-folder creation failed:", err);
          autoOrganizeMessage =
            "AI label found, but folder could not be assigned. File saved in root.";
        }
      } else {
        autoOrganizeMessage =
          "AI could not determine a folder. File saved in root.";
      }
    }

    // Metadata with AI results
    const metadata = {
      size: file.size,
      type: file.mimetype,
      extension: ext,
      ...aiMeta,
    };

    const newFile = await File.create({
      user: req.user._id,
      folder: targetFolderId, // root if null
      filename: file.originalname,
      fileUrl,
      encryptionType: encryptionType || "NONE",
      key: key?.toString("hex") || null,
      iv: iv?.toString("hex") || null,
      tags: parsedTags,
      metadata,
    });

    // Update user storage
    req.user.storageUsed += file.size;
    await req.user.save();

    console.log("AI classification:", aiMeta);

    res.status(201).json({
      success: true,
      file: newFile,
      autoOrganizeMessage,
    });
  } catch (err) {
    console.error("AI Upload error:", err);
    res.status(500).json({ error: "AI file upload failed" });
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

export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const fileDoc = await File.findById(id);

    if (!fileDoc) return res.status(404).json({ error: "File not found" });
    if (!fileDoc.user.equals(req.user._id))
      return res.status(403).json({ error: "Unauthorized" });

    // Move to Trash
    await Trash.create({
      user: req.user._id,
      itemType: "file",
      itemId: fileDoc._id,
      name: fileDoc.filename,
      metadata: fileDoc.metadata,
    });

    // Remove from Files collection (but not Azure yet)
    await fileDoc.deleteOne();

    res.json({ success: true, message: "File moved to trash" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

export const getStorageInfo = async (req, res) => {
  try {
    const { storageUsed, storageLimit } = req.user;
    res.json({
      success: true,
      storageUsed,
      storageLimit,
      usedPercentage: ((storageUsed / storageLimit) * 100).toFixed(2)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve storage information" });
  }
};