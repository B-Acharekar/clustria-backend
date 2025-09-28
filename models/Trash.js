import mongoose from "mongoose";

const TrashSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemType: { type: String, enum: ["file", "folder"], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    metadata: { type: Object },
    deletedAt: { type: Date, default: Date.now, index: true }, // index for TTL
  },
  { timestamps: true }
);

// TTL index: auto delete after 15 days (15 * 24 * 60 * 60 seconds)
TrashSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 15 * 24 * 60 * 60 });

export default mongoose.model("Trash", TrashSchema);
