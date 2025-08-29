import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
export const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
export const CONTAINER_NAME = process.env.CONTAINER_NAME;
export const JWT_SECRET = process.env.JWT_SECRET || "fallbacksecret"; 
