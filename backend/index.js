import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/user.route.js";
import promptRoutes from "./routes/promt.route.js"; 

dotenv.config();
const app = express();
const port = process.env.PORT || 4002; // Ensure this matches your Postman URL
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// DB Connection (FIXED)
mongoose
  .connect(MONGO_URL) // Removed deprecated options
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB Connection Error:", error));

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/deepseekai", promptRoutes);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});