import groq from "../groq.js";

export async function chatWithNotes(
  req,
  res
) {

  try {

    const {

      question,

      noteText,

      history=[]

    } = req.body;

    const completion =
      await groq.chat.completions.create({

        model:
          "llama-3.1-8b-instant",

        temperature:0.4,

        max_tokens:1000,

        messages:[

          {
            role:"system",

            content:`

You are a study tutor.

Use ONLY the uploaded notes.

NOTES:

${noteText}
`,
          },

          ...history.slice(-8),

          {
            role:"user",

            content:question,
          },
        ],
      });

    return res.json({

      success:true,

      answer:
        completion.choices[0]
        ?.message?.content,
    });

  } catch (error) {

    console.log(error);

    return res
      .status(500)
      .json({
        success:false,
      });
  }
}