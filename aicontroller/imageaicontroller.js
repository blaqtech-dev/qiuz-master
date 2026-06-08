import fs from "fs";

import sharp from "sharp";

import Tesseract from "tesseract.js";

import {
  explainImageText,
} from "../services/imageaiservices.js";

export async function analyzeImage(
  req,
  res
) {

  let optimizedPath = "";

  try {

    const image = req.file;

    const question =
      req.body.question ||
      "Explain this image";

    if (!image) {

      return res.status(400).json({

        success: false,

        error:
          "No image uploaded",
      });
    }

    console.log(
      "🖼 Image Received:",
      image.filename
    );

    /* ===============================
       SAFE JPG OUTPUT
    ================================ */

    optimizedPath =
      `${image.path}-optimized.jpg`;

    /* ===============================
       TRY SHARP CONVERSION
    ================================ */

    try {

      await sharp(image.path, {

        failOn: "none",
      })

        .rotate()

        .flatten({
          background: "#ffffff",
        })

        .jpeg({
          quality: 90,
        })

        .resize({
          width: 1600,
          withoutEnlargement: true,
        })

        .toFile(optimizedPath);

      console.log(
        "✅ Image Optimized"
      );

    } catch (sharpError) {

      console.log(
        "❌ Sharp Failed:",
        sharpError.message
      );

      // fallback:
      // use original image directly

      optimizedPath =
        image.path;

      console.log(
        "⚠ Using original image"
      );
    }

    /* ===============================
       OCR
    ================================ */

    const result =
      await Tesseract.recognize(
        optimizedPath,
        "eng"
      );

    const extractedText =
      result.data.text || "";

    console.log(
      "📄 OCR Length:",
      extractedText.length
    );

    /* ===============================
       NO TEXT DETECTED
    ================================ */

    if (
      extractedText.trim().length <
      5
    ) {

      return res.status(400).json({

        success: false,

        error:
          "No readable text found in image",
      });
    }

    /* ===============================
       AI ANALYSIS
    ================================ */

    const answer =
      await explainImageText(

        extractedText.slice(
          0,
          7000
        ),

        question
      );

    /* ===============================
       CLEAN FILES
    ================================ */

    try {

      if (
        fs.existsSync(image.path)
      ) {

        fs.unlinkSync(image.path);
      }

      if (

        optimizedPath !==
          image.path &&

        fs.existsSync(
          optimizedPath
        )
      ) {

        fs.unlinkSync(
          optimizedPath
        );
      }

    } catch (cleanupError) {

      console.log(
        "Cleanup Error:",
        cleanupError.message
      );
    }

    return res.status(200).json({

      success: true,

      answer,

      extractedText,
    });

  } catch (error) {

    console.log(
      "❌ Image Controller Error:",
      error.message
    );

    return res.status(500).json({

      success: false,

      error:
        "Image AI failed",
    });
  }
}