import { generateSummary } from "../services/aiservices";

export async function summarizeChunks(chunks) {

  const summaries = [];

  for (const chunk of chunks) {

    try {

      const summary =
        await generateSummary(chunk);

      summaries.push(summary);

    } catch (error) {

      console.log(
        "Chunk summary failed"
      );
    }
  }

  return summaries.join("\n");
}