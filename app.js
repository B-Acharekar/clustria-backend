import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fileRoutes from "./routes/fileRoutes.js";
import authRoutes from "./routes/userRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import { MONGO_URI, PORT } from "./config.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: `${process.env.FRONTEND_PORT}`, // your frontend URL
  credentials: true, // if you need cookies/auth
}));

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// File routes
app.use("/api/files", fileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
