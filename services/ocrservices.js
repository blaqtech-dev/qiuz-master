import Tesseract from "tesseract.js";

export async function extractTextFromImage(
  imagePath
) {
  try {

    const result =
      await Tesseract.recognize(
        imagePath,
        "eng"
      );

    return result.data.text;

  } catch (error) {

    console.log(
      "OCR Error:",
      error.message
    );

    return "";
  }
}