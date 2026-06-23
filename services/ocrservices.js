import Tesseract from "tesseract.js";

export async function extractTextFromImage(
  imagePath
) {

  console.log(
    "OCR IMAGE:",
    imagePath
  );

  try {

    const result =
      await Tesseract.recognize(
        imagePath,
        "eng"
      );

    console.log(
      "OCR SUCCESS:",
      result.data.text.length
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