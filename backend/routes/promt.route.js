import express from "express";
import { sendPromt } from "../controller/promt.controller.js";
// Update this line to match the correct spelling:
import userMiddleware from "../middleware/promt.middleware.js";

const router = express.Router();

router.post("/promt", userMiddleware, sendPromt);

export default router;