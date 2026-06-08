import groq from "../groq.js";

export async function explainImageText(
  extractedText,
  question
) {

  try {

    const completion =
      await groq.chat.completions.create({

        model:
          "llama-3.1-8b-instant",

        temperature: 0.4,

        max_tokens: 500,

        messages: [

          {
            role: "system",

            content: `
You are an AI educational tutor.

The user uploaded an image.

The image text was extracted using OCR.

Your job:

1. Explain the content clearly
2. Teach like a tutor
3. Simplify difficult concepts
4. Answer the user's question
5. If mathematics exists, explain step-by-step
6. If notes are messy, still try to understand
7. Be educational and friendly
`,
          },

          {
            role: "user",

            content: `
QUESTION:

${question}

IMAGE TEXT:

${extractedText}
`,
          },
        ],
      });

    return (
      completion.choices[0]
        ?.message?.content ||
      "AI could not explain the image."
    );

     } catch (error) {

    console.log(
      "❌ Image AI Error:",
      error.message
    );

    return "AI failed to analyze image.";
  }
}