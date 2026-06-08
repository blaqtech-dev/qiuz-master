
import { chunkText } from "../utils/chunktext.js";

import {
  generateQuizFromChunk,
  generateSummary,
  generateFlashcards,
} from "../services/aiservices.js";

import { extractPdfFromUrl } from "../services/pdfserices.js";

import { cleanPdfText } from "../utils/cleanpdftext.js";

// ================= CLEAN TEXT =================

function cleanText(text = "") {

  return text
    .replace(/\*\*/g, "")
    .replace(/#/g, "")
    .replace(/`/g, "")
    .trim();
}

// ================= VALIDATE QUESTIONS =================
function validateQuestions(questions = []) {

  return questions.filter((q) => {

    if (
      !q?.question ||
      !Array.isArray(q?.options) ||
      q.options.length !== 4 ||
      !q?.answer ||
      !q?.explanation
    ) {
      return false;
    }

    const clean = (str) =>
      str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

    const normalizedOptions = q.options.map(clean);
    const normalizedAnswer = clean(q.answer);

    return normalizedOptions.includes(normalizedAnswer);
  });
}

// ================= REMOVE DUPLICATES =================

function removeDuplicateQuestions(
  questions = []
) {

  return questions.filter(

    (question, index, self) =>

      index ===
      self.findIndex(

        (q) =>

          q.question
            ?.trim()
            .toLowerCase() ===

          question.question
            ?.trim()
            .toLowerCase()
      )
  );
}

// ================= SHUFFLE =================

function shuffleArray(array = []) {

  return [...array].sort(
    () => Math.random() - 0.5
  );
}

// ================= MAIN CONTROLLER =================

export async function generateQuiz(
  req,
  res
) {

  try {

    // ================= GET PDF URL =================

    const { pdfUrl } = req.body;

    // ================= VALIDATION =================

    if (!pdfUrl) {

      return res.status(400).json({

        success: false,

        error:
          "No PDF URL provided",
      });
    }

    // ================= DOWNLOAD + EXTRACT PDF =================

    const rawText =
      await extractPdfFromUrl(
        pdfUrl
      );

    // ================= CHECK EXTRACTION =================

    if (!rawText) {

      return res.status(400).json({

        success: false,

        error:
          "Could not extract PDF text",
      });
    }

    // ================= CLEAN PDF TEXT =================

    const cleanedText =
      cleanPdfText(rawText);

    // ================= CREATE CHUNKS =================

    const chunks =

      chunkText(
        cleanedText,
        2500
      ).slice(0, 5);

    console.log(
      "📦 Total Chunks Used:",
      chunks.length
    );

    // ================= STORAGE =================

    let allQuestions = [];

    let failedChunks = 0;

    // ================= PROCESS CHUNKS IN PARALLEL =================

   const chunkResults = [];

for (let i = 0; i < chunks.length; i++) {

  try {

    console.log(`🧠 Processing Chunk ${i + 1}/${chunks.length}`);

    const generatedQuestions =
      await generateQuizFromChunk(chunks[i]) || [];

    const validQuestions =
      Array.isArray(generatedQuestions)
        ? validateQuestions(generatedQuestions)
        : [];

    chunkResults.push(validQuestions);

  } catch (error) {

    failedChunks++;

    console.log(`❌ Chunk ${i + 1} Failed:`, error.message);
  }
}
    // ================= MERGE QUESTIONS =================

    allQuestions =
      chunkResults.flat();

    // ================= REMOVE DUPLICATES =================

    const uniqueQuestions =

      removeDuplicateQuestions(
        allQuestions
      );

    // ================= SHUFFLE =================

    const shuffledQuestions =

      shuffleArray(
        uniqueQuestions
      );

    // ================= FINAL QUESTIONS =================

    const finalQuestions =

      shuffledQuestions.slice(
        0,
        25
      );

    // ================= SUMMARY =================

    let summary = "";

    try {

      const generatedSummary =

        await generateSummary(

          cleanedText.slice(
            0,
            20000
          )
        );

      summary =
        cleanText(
          generatedSummary
        );

    } catch (error) {

      console.log(
        "❌ Summary Error:",
        error.message
      );

      summary =
        "Summary could not be generated.";
    }

    // ================= FLASHCARDS =================

    let flashcards = [];

    try {

      const generatedFlashcards =

        await generateFlashcards(

          cleanedText.slice(
            0,
            15000
          )
        );

      flashcards =

        Array.isArray(
          generatedFlashcards
        )

          ? generatedFlashcards.filter(

              (card) =>

                card?.question &&
                card?.answer
            )

          : [];

      console.log(
        "🧠 Flashcards Generated:",
        flashcards.length
      );

    } catch (error) {

      console.log(
        "❌ Flashcard Error:",
        error.message
      );

      flashcards = [];
    }

    // ================= ANALYTICS =================

    const analytics = {

      originalTextLength:
        rawText.length,

      processedTextLength:
        cleanedText.length,

      totalChunks:
        chunks.length,

      failedChunks,

      generatedQuestions:
        allQuestions.length,

      uniqueQuestions:
        uniqueQuestions.length,

      finalQuestions:
        finalQuestions.length,

      flashcards:
        flashcards.length,
    };

    console.log(
      "📊 Analytics:",
      analytics
    );

    // ================= SUCCESS CHECK =================

    const success =

      finalQuestions.length > 0 ||

      flashcards.length > 0 ||

      summary !== "";

    // ================= RESPONSE =================

    return res.status(200).json({

      success,

      summary,

      flashcards,

      totalQuestions:
        finalQuestions.length,

      questions:
        finalQuestions,

      analytics,
    });

  } catch (error) {

    console.log(
      "🔥 Controller Error:",
      error.message
    );

    return res.status(500).json({

      success: false,

      error:
        "AI generation failed",

      details:
        error.message,
    });
  }
}

