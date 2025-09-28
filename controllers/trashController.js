import Trash from "../models/Trash.js";
import File from "../models/File.js";
import Folder from "../models/Folder.js";
import { deleteFromAzure } from "../utils/azureUpload.js";

// 🔹 Get all trash items for current user
export const listTrash = async (req, res) => {
  try {
    const items = await Trash.find({ user: req.user._id }).sort({ deletedAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trash" });
  }
};

// 🔹 Restore a trashed item
export const restoreItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Trash.findOne({ _id: id, user: req.user._id });
    if (!item) return res.status(404).json({ error: "Item not found in trash" });

    if (item.itemType === "file") {
      // Restore file
      await File.create({
        _id: item.itemId, // reuse old id so references stay valid
        user: item.user,
        filename: item.name,
        metadata: item.metadata,
        folder: item.metadata.folder || null,
        fileUrl: item.metadata.fileUrl,
        encryptionType: item.metadata.encryptionType,
        key: item.metadata.key,
        iv: item.metadata.iv,
        tags: item.metadata.tags || [],
      });
    } else if (item.itemType === "folder") {
      // Restore folder
      await Folder.create({
        _id: item.itemId,
        user: item.user,
        name: item.name,
        parent: item.metadata?.parent || null,
      });
    }

    await Trash.deleteOne({ _id: id });
    res.json({ success: true, message: "Item restored successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to restore item" });
  }
};

// 🔹 Permanently delete a trashed item (manual clean-up)
export const permanentlyDeleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Trash.findOne({ _id: id, user: req.user._id });
    if (!item) return res.status(404).json({ error: "Item not found in trash" });

    // Remove from Azure if file
    if (item.itemType === "file" && item.metadata?.filename) {
      try {
        await deleteFromAzure(item.metadata.filename);
      } catch (err) {
        console.error("Azure delete failed:", err);
      }
    }

    await Trash.deleteOne({ _id: id });
    res.json({ success: true, message: "Item permanently deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to permanently delete item" });
  }
};

// 🔹 Empty entire trash
export const emptyTrash = async (req, res) => {
  try {
    const items = await Trash.find({ user: req.user._id });

    for (const item of items) {
      if (item.itemType === "file" && item.metadata?.filename) {
        try {
          await deleteFromAzure(item.metadata.filename);
        } catch (err) {
          console.error("Azure delete failed:", err);
        }
      }
    }

    await Trash.deleteMany({ user: req.user._id });
    res.json({ success: true, message: "Trash emptied" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to empty trash" });
  }
};
export const getTrashItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Trash.findOne({ _id: id, user: req.user._id });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trash item" });
  }
};
