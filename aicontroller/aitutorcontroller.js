
import { askAiTutor } from "../services/aitutorservice.js";
import { extractPdfFromUrl }
from "../services/pdfserices.js";

import { cleanPdfText }
from "../utils/cleanpdftext.js";

// ================= AI TUTOR =================

export async function aiTutorChat(
  req,
  res
) {

  try {

    const {
      question,
      pdfUrl,
      history,
    } = req.body;

    // ================= VALIDATION =================

    if (!question || !pdfUrl) {

      return res.status(400).json({

        success: false,

        error:
          "Question and PDF URL required",
      });
    }

    // ================= EXTRACT PDF =================

    const rawText =
      await extractPdfFromUrl(
        pdfUrl
      );

    if (!rawText) {

      return res.status(400).json({

        success: false,

        error:
          "Could not extract PDF",
      });
    }

    // ================= CLEAN =================

    const cleanedText =
      cleanPdfText(rawText);

    // ================= AI RESPONSE =================

    const answer =
      await askAiTutor(

        question,

        cleanedText,

        history || []
      );

    // ================= RESPONSE =================

    return res.status(200).json({

      success: true,

      answer,
    });

  } catch (error) {

    console.log(
      "❌ AI Tutor Controller:",
      error.message
    );

    return res.status(500).json({

      success: false,

      error:
        "AI Tutor failed",
    });
  }
}