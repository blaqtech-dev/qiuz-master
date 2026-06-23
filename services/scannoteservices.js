import groq from "../groq.js";

export async function generateNoteSummary(
  noteText,
  noteTitle
) {
  try {
    const completion =
      await groq.chat.completions.create({

        model:
          "llama-3.1-8b-instant",

        temperature: 0.4,

        max_tokens: 1500,

        messages: [

          {
            role: "system",

            content: `
You are an AI Study Assistant.

Analyze study notes.

Generate:

1. Detailed Summary

2. Key Concepts

3. Important Formulas

4. Important Definitions

5. Exam Tips

6. 10 Practice Questions

Make it educational.
`,
          },

          {
            role: "user",

            content: `
TITLE:

${noteTitle}

NOTES:

${noteText}
`,
          },
        ],
      });

    return (
      completion.choices[0]
        ?.message?.content ||
      "No summary generated."
    );

  } catch (error) {

    console.log(error);

    return "AI failed.";
  }
}