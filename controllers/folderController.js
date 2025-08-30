import Folder from "../models/Folder.js";
import File from "../models/File.js";

// Create folder
export const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const folder = await Folder.create({
      name,
      parent: parentId || null,
      user: req.user._id, // consistency with File
    });

    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: "Error creating folder", error });
  }
};

// Get folder contents (files + subfolders)
export const getFolder = async (req, res) => {
  try {
    const folderId = req.params.id || null; // root if no id

    const folders = await Folder.find({ user: req.user._id, parent: folderId });
    const files = await File.find({ user: req.user._id, folder: folderId });

    res.json({ folders, files });
  } catch (error) {
    res.status(500).json({ message: "Error fetching folder", error });
  }
};

// Rename folder
export const renameFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name },
      { new: true }
    );

    if (!folder) return res.status(404).json({ message: "Folder not found" });
    res.json(folder);
  } catch (error) {
    res.status(500).json({ message: "Error renaming folder", error });
  }
};

// Delete folder + cascade delete
export const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    // recursive delete helper
    const deleteRecursive = async (folderId) => {
      const subfolders = await Folder.find({ parent: folderId, user: req.user._id });

      for (const sub of subfolders) {
        await deleteRecursive(sub._id);
      }

      await File.deleteMany({ folder: folderId, user: req.user._id });
      await Folder.deleteOne({ _id: folderId, user: req.user._id });
    };

    await deleteRecursive(folder._id);

    res.json({ message: "Folder and contents deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting folder", error });
  }
};
