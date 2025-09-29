import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fileRoutes from "./routes/fileRoutes.js";
import authRoutes from "./routes/userRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import paymentRoutes from "./routes/paymentRoute.js";
import trashRoutes from "./routes/trashRoutes.js";
import { MONGO_URI, PORT } from "./config.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const allowedOrigins = [
  "http://localhost:3000",                     // local dev
  "https://clustria-frontend.vercel.app"      // production frontend
];
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like Postman) or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// File routes
app.use("/api/files", fileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/trash", trashRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
