import express from "express";

import { aiTutorChat } from "../aicontroller/aitutorcontroller.js";

const router =
  express.Router();

// ================= AI TUTOR CHAT =================

router.post(
  "/ai-tutor",
  aiTutorChat
);

export default router;