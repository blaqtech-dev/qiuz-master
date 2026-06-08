import groq from "../groq.js";

export async function imageTutorChat(
  req,
  res
) {

  try {

    const {
      question,
      imageAnalysis,
      history = [],
    } = req.body;

    if (
      !question ||
      !imageAnalysis
    ) {

      return res.status(400).json({
        success: false,
        error:
          "Missing data",
      });
    }

    // ================= MEMORY =================

    const memory =
      history.slice(-6);

    // ================= AI =================

    const completion =
      await groq.chat.completions.create({

        model:
          "llama-3.1-8b-instant",

        temperature: 0.5,

        max_tokens: 800,

        messages: [

          {
            role: "system",

            content: `
You are an AI image tutor.

The uploaded image was analyzed.

IMAGE ANALYSIS:

${imageAnalysis}

Your job:
- answer questions about the image
- teach students
- explain concepts
- give examples
- simplify difficult topics
`,
          },

          ...memory,

          {
            role: "user",

            content: question,
          },
        ],
      });

    const answer =
      completion.choices[0]
        ?.message?.content ||
      "No response";

    return res.status(200).json({

      success: true,

      answer,
    });

  } catch (error) {

    console.log(
      "❌ Image Chat Error:",
      error.message
    );

    return res.status(500).json({

      success: false,

      error:
        "AI image tutor failed",
    });
  }
}