
// routes/quizroutes.js

import express from "express";

import {
  generateQuiz,
} from "../aicontroller/aicontroller.js";

const router =
  express.Router();

// ================= TEST ROUTE =================

router.get(
  "/test",
  (req, res) => {

    res.status(200).json({

      success: true,

      message:
        "Quiz route working",
    });
  }
);

// ================= GENERATE QUIZ =================

router.post(
  "/generate-quiz",
  generateQuiz
);

export default router;

