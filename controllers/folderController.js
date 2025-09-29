import mongoose from "mongoose";
import Folder from "../models/Folder.js";
import File from "../models/File.js";
import Trash from "../models/Trash.js";

// Create folder
export const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const folder = await Folder.create({
      name,
      parent: parentId ? new mongoose.Types.ObjectId(parentId) : null,
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

export const getFolderPath = async (req, res) => {
  try {
    const folderId = req.params.id;
    if (!folderId) return res.json([]);

    let path = [];
    let current = await Folder.findOne({ _id: folderId, user: req.user._id });

    while (current) {
      path.unshift({ id: current._id, name: current.name });
      if (!current.parent) break;
      current = await Folder.findOne({ _id: current.parent, user: req.user._id });
    }

    res.json(path);
  } catch (error) {
    res.status(500).json({ message: "Error fetching folder path", error });
  }
};

// Delete folder + cascade delete
export const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    // recursive move-to-trash
    const moveRecursive = async (folderId) => {
      const subfolders = await Folder.find({ parent: folderId, user: req.user._id });

      for (const sub of subfolders) {
        await moveRecursive(sub._id);
      }

      const files = await File.find({ folder: folderId, user: req.user._id });
      for (const f of files) {
        await Trash.create({
          user: req.user._id,
          itemType: "file",
          itemId: f._id,
          name: f.filename,
          metadata: f.metadata,
        });
        await f.deleteOne();
      }

      await Trash.create({
        user: req.user._id,
        itemType: "folder",
        itemId: folderId,
        name: folder.name,
        metadata: {
          parent: folder.parent || null,
        },
      });

      await Folder.deleteOne({ _id: folderId, user: req.user._id });
    };

    await moveRecursive(folder._id);

    res.json({ message: "Folder and contents moved to trash" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting folder", error });
  }
};

export const createDefaultFolders = async (userId) => {
  const defaultFolders = ["Documents", "Images", "Videos"];

  const folderDocs = defaultFolders.map(name => ({
    name,
    parent: null,
    user: userId,
  }));

  await Folder.insertMany(folderDocs);
};

export const getAllFoldersForSidebar = async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).lean();
    res.json({ folders }); // flat list, no recursion
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch folders", error: err });
  }
};
