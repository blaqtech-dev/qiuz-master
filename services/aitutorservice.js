import groq from "../groq.js";

// ================= ASK AI TUTOR =================

export async function askAiTutor(
  question,
  pdfText,
  chatHistory = []
) {

  try {

    // ================= SMALLER TEXT =================

    const safeText = pdfText
      .replace(/\s+/g, " ")
      .trim()
    .slice(0, 5000);

    // ================= LIMIT MEMORY =================

    const memoryMessages =
    chatHistory.slice(-3)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

    // ================= AI =================

    const completion =
      await groq.chat.completions.create({

        model:
  "llama-3.1-8b-instant",

        temperature: 0.3,

      max_tokens: 500,

        messages: [

          {
            role: "system",

            content: `
You are an AI study tutor.

Answer ONLY using the PDF.

Keep answers:
- short
- educational
- clear
- beginner friendly
-answer all questions that relate to the pdf content
-make sure you find solution to any question that is asked base on the pdf content
If answer is missing:
"This was not found in the PDF."
`,
          },

          {
            role: "system",

            content: `
PDF CONTENT:

${safeText}
`,
          },

          ...memoryMessages,

          {
            role: "user",

            content: question,
          },
        ],
      });

    return (

      completion.choices[0]
        ?.message?.content ||

      "No response generated."
    );

  } catch (error) {

    console.log(
      "❌ AI Tutor Error:",
      error.response?.data ||
      error.message
    );

    // ================= RATE LIMIT =================

    if (
      error.status === 429 ||
      error.code ===
        "rate_limit_exceeded"
    ) {

      return "AI limit reached. Please wait a few minutes.";
    }

    return "AI tutor failed to respond.";
  }
}