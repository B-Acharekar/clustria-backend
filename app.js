import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fileRoutes from "./routes/fileRoutes.js";
import authRoutes from "./routes/userRoutes.js";
import { MONGO_URI, PORT } from "./config.js";

dotenv.config();
const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// File routes
app.use("/api/files", fileRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
