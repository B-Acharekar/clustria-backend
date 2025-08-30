import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null, // root folder if null
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // <- match your controller
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Folder", folderSchema);
