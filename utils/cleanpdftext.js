// ================= CLEAN PDF TEXT =================

export function cleanPdfText(text = "") {

  if (!text) return "";

  return text

    // remove line breaks
    .replace(/\r/g, " ")

    // remove multiple spaces
    .replace(/\s+/g, " ")

    // remove page numbers
    .replace(/\bPage\s+\d+\b/gi, "")

    // remove URLs
    .replace(/https?:\/\/\S+/g, "")

    // remove weird symbols
    .replace(/[^\w\s.,?!:;()\-]/g, "")

    // remove repeated spaces
    .replace(/\s{2,}/g, " ")

    .trim();
}