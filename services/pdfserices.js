import axios from "axios";

import pdfParse from "pdf-parse";

import https from "https";

// ================= CACHE =================

const pdfCache = new Map();

// ================= AXIOS INSTANCE =================

const axiosInstance = axios.create({

  timeout: 30000,

  httpsAgent: new https.Agent({

    keepAlive: true,
  }),
});

// ================= DELAY =================

function delay(ms) {

  return new Promise((resolve) => {

    setTimeout(resolve, ms);

  });
}

// ================= EXTRACT PDF =================

export async function extractPdfFromUrl(
  pdfUrl
) {

  try {

    // ================= CACHE =================

    if (pdfCache.has(pdfUrl)) {

      console.log(
        "✅ Using Cached PDF"
      );

      return pdfCache.get(pdfUrl);
    }

    console.log(
      "📄 PDF URL:",
      pdfUrl
    );

    let response;

    // ================= RETRY DOWNLOAD =================

    for (let i = 0; i < 3; i++) {

      try {

        response =
          await axiosInstance.get(
            pdfUrl,
            {
              responseType:
                "arraybuffer",
            }
          );

        break;

      } catch (error) {

        console.log(
          `❌ Download Retry ${i + 1}`
        );

        if (i === 2) {

          throw error;
        }

        await delay(2000);
      }
    }

    console.log(
      "✅ PDF Downloaded"
    );

    // ================= BUFFER =================

    const pdfBuffer =
      Buffer.from(
        response.data
      );

    // ================= PARSE PDF =================

    const pdfData =
      await pdfParse(
        pdfBuffer
      );

    console.log(
      "✅ PDF Parsed"
    );

    let text =
      pdfData.text || "";

if (
  !text ||
  text.trim().length < 100
) {

  throw new Error(
    "Scanned PDF detected"
  );
}

    console.log(
      "📄 Original Length:",
      text.length
    );

    // ================= CLEAN =================

    text = text
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 15000);

    console.log(
      "📄 Final Length:",
      text.length
    );

    // ================= SAVE CACHE =================

    pdfCache.set(
      pdfUrl,
      text
    );

    return text;

  } catch (error) {

    console.log(
      "❌ PDF Extraction Error:",
      error.message
    );

    return "";
  }
}