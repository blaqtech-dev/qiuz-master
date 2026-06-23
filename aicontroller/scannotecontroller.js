import fs from "fs";

import sharp from "sharp";

import Tesseract from "tesseract.js";

import {
  generateNoteSummary,
}
from "../services/scannoteservices.js";

export async function analyzeNotes(
  req,
  res
) {

  try {

    const files =
      req.files || [];

    const title =
      req.body.title ||
      "My Notes";

    if (
      files.length === 0
    ) {

      return res
        .status(400)
        .json({
          success:false,
          error:
            "No images uploaded",
        });
    }

    let fullText = "";

    for (
      let i = 0;
      i < files.length;
      i++
    ) {

      const file =
        files[i];

      let optimized =
        `${file.path}-opt.jpg`;

      try {

        await sharp(
          file.path
        )

          .rotate()

          .flatten({
            background:
              "#ffffff",
          })

          .jpeg({
            quality:90,
          })

          .resize({
            width:1600,
            withoutEnlargement:true,
          })

          .toFile(
            optimized
          );

        const result =
          await Tesseract.recognize(
            optimized,
            "eng"
          );

        fullText +=
          "\n\n";

        fullText +=
          result.data.text;

      } catch (err) {

        console.log(err);
      }

      try {

        if (
          fs.existsSync(
            file.path
          )
        ) {

          fs.unlinkSync(
            file.path
          );
        }

        if (
          fs.existsSync(
            optimized
          )
        ) {

          fs.unlinkSync(
            optimized
          );
        }

      } catch {}
    }

    const summary =
      await generateNoteSummary(

        fullText.slice(
          0,
          30000
        ),

        title
      );

    return res.json({

      success:true,

      summary,

      noteText:
        fullText,
    });

  } catch (error) {

    console.log(error);

    return res
      .status(500)
      .json({
        success:false,
        error:
          "Failed",
      });
  }
}