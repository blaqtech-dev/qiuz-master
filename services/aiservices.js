import groq from "../groq.js";
import { jsonrepair }
from "jsonrepair";
// ================= CLEAN RESPONSE =================

function cleanJsonResponse(text) {

  if (!text) return "";

  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/\r/g, "")
    .replace(/\n/g, " ")
    .trim();
}

// ================= SAFE PARSER =================

function safeJsonParse(text) {

  try {

    return JSON.parse(
  jsonrepair(text)
);

  } catch (error) {

    console.log(
      "❌ JSON Parse Error:",
      error.message
    );

    return [];
  }
}

// ================= DELAY =================

function delay(ms) {

  return new Promise((resolve) => {

    setTimeout(resolve, ms);

  });
}

// ================= QUIZ GENERATION =================

export async function generateQuizFromChunk(
  chunk
) {

  try {

    // ================= CLEAN + LIMIT =================

    const safeChunk =

      chunk
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 2500);

    // ================= SMALL DELAY =================

    await delay(1200);

    // ================= AI REQUEST =================

    const completion =

      await groq.chat.completions.create({

        model:
  "llama-3.1-8b-instant",

        temperature: 0.2,

    max_tokens: 2000,

        messages: [

          {
            role: "system",

            content: `
You are an advanced educational AI.
Generate ONLY valid JSON.

STRICT RULES:

1. No markdown
2. No explanations outside JSON
3. Generate exactly 4 quiz questions
4. Each question MUST contain:
   - question
   - options
   - answer
   - explanation
5. Exactly 4 options
6. The answer MUST be the FULL option text
7. NEVER return A, B, C, or D
8. Keep explanations short
9. Return ONLY JSON array

CORRECT FORMAT:

[
  {
    "question": "What is React?",
    "options": [
      "A JavaScript library",
      "A database",
      "A backend framework",
      "An operating system"
    ],
    "answer": "A JavaScript library",
    "explanation": "React is a frontend JavaScript library."
  }
]
`,
          },

        {
role: "user",

content: `
Educational Content:

${safeChunk}

Generate:

* Conceptual questions
* Theory questions
* Application questions
* Real understanding questions

Avoid repetition.
Make questions challenging but clear.
`,
},

        ],
      });

    // ================= RAW RESPONSE =================

    const rawText =

      completion.choices[0]
      ?.message?.content || "[]";

    console.log(
      "🧠 RAW QUIZ RESPONSE:",
      rawText
    );

    // ================= CLEAN =================

    const cleaned =
      cleanJsonResponse(rawText);

    // ================= PARSE =================

    const parsed =
      safeJsonParse(cleaned);

    // ================= VALIDATION =================

    if (!Array.isArray(parsed)) {

      return [];
    }

    // ================= FILTER VALID QUESTIONS =================

    const validQuestions =

      parsed.filter((question) => {

        return (

          question?.question &&

          Array.isArray(
            question?.options
          ) &&

          question.options.length === 4 &&

          question?.answer &&

          question.options.includes(
            question.answer
          ) &&

          question?.explanation
        );
      });

    return validQuestions;

  } catch (error) {

    console.log(
      "❌ Quiz Generation Error:",
      error.message
    );

    return [];
  }
}

// ================= SUMMARY =================

export async function generateSummary(
  text
) {

  try {

    const safeText =
      text
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 2500);

    const completion =
      await groq.chat.completions.create({

        model:
          "llama-3.1-8b-instant",

        temperature: 0.2,

        max_tokens: 800,

        messages: [

          {
            role: "system",

            content: `
Create a study summary.

Requirements:

- Plain text only
- No markdown
- No bullet points
- Explain key concepts
- Keep it educational
- Keep it concise
`
          },

          {
            role: "user",

            content: safeText
          }
        ]
      });

    console.log(
      "SUMMARY RESPONSE:",
      completion
    );

    const summary =
      completion?.choices?.[0]
      ?.message?.content
      ?.trim();

    return (
      summary ||
      "Summary could not be generated."
    );

  } catch (error) {

    console.log(
      "❌ SUMMARY ERROR:",
      error
    );

    return "Summary could not be generated.";
  }
}

// ================= FLASHCARDS =================

export async function generateFlashcards(
  text
) {

  try {

    const safeText =

      text
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 3000);

    await delay(800);

    const completion =

      await groq.chat.completions.create({

        model:
          "llama-3.1-8b-instant",

        temperature: 0.2,

        max_tokens: 1000,

        messages: [

          {
            role: "system",

            content: `
You are an AI flashcard generator.

Return ONLY valid JSON.

STRICT RULES:

1. No markdown
2. No explanations outside JSON
3. Generate exactly 15 flashcards
4. Keep answers concise
5. Return ONLY JSON array

VALID FORMAT:

[
  {
    "question": "Question",
    "answer": "Answer"
  }
]
`,
          },

          {
            role: "user",

            content: `
Generate flashcards from this educational content:

${safeText}
`,
          },
        ],
      });

    // ================= RAW RESPONSE =================

    const rawText =

      completion.choices[0]
      ?.message?.content || "[]";

    console.log(
      "🧠 RAW FLASHCARD RESPONSE:",
      rawText
    );

    // ================= CLEAN =================

    const cleaned =
      cleanJsonResponse(rawText);

    // ================= PARSE =================

    const parsed =
      safeJsonParse(cleaned);

    if (!Array.isArray(parsed)) {

      return [];
    }

    // ================= VALIDATE =================

    const validFlashcards =

      parsed.filter((card) => {

        return (
          card?.question &&
          card?.answer
        );
      });

    return validFlashcards;

  } catch (error) {

    console.log(
      "❌ Flashcard Error:",
      error.message
    );

    return [];
  }
}