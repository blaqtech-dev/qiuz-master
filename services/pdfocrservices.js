import fs from "fs";
import path from "path";

import { fromBuffer }
from "pdf2pic";

import { extractTextFromImage } from "./ocrservices.js";

export async function extractPdfUsingOCR(
  pdfBuffer
) {

  try {

    const tempDir =
      "./temp";

    if (
      !fs.existsSync(tempDir)
    ) {

      fs.mkdirSync(tempDir);
    }

    const pdfPath =
      path.join(
        tempDir,
        `scan-${Date.now()}.pdf`
      );

    fs.writeFileSync(
      pdfPath,
      pdfBuffer
    );

    const converter =
      fromBuffer(
        pdfBuffer,
        {
          density: 150,
          savePath:
            tempDir,
          format: "png",
          width: 1200,
          height: 1600,
        }
      );

    let fullText = "";

    for (
      let page = 1;
      page <= 20;
      page++
    ) {

      try {

        const result =
          await converter(page);

        const text =
          await extractTextFromImage(
            result.path
          );

        fullText +=
          text + "\n";

      } catch {

        break;
      }
    }

    return fullText;

  } catch (error) {

    console.log(
      "OCR PDF ERROR:",
      error.message
    );

    return "";
  }
}