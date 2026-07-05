import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/user.route.js";
import promptRoutes from "./routes/promt.route.js"; 

dotenv.config();
const app = express();

// FIXED: BACKEND_PORT undefined ho sakta tha, isliye 5000 fallback diya hai
const port = process.env.PORT || 5000; 
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(express.json());
app.use(cookieParser());

// FIXED: CORS array use kiya hai taaki Vercel aur localhost dono chal sakein
app.use(
  cors({
    origin: [
      "https://deepseekai-umber.vercel.app", 
      "http://localhost:5173",
      process.env.FRONTEND_URL
    ].filter(Boolean), 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// DB Connection
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB Connection Error:", error));

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/deepseekai", promptRoutes);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});