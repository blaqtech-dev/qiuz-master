import express from "express";

import multer from "multer";

import fs from "fs";

import path from "path";

import {
  analyzeImage,
} from "../aicontroller/imageaicontroller.js";

const router = express.Router();

/* ===============================
   CREATE UPLOAD FOLDER
================================ */

const uploadPath =
  path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadPath)) {

  fs.mkdirSync(uploadPath, {
    recursive: true,
  });

  console.log(
    "✅ Uploads folder created"
  );
}

/* ===============================
   STORAGE
================================ */

const storage = multer.diskStorage({

  destination: (
    req,
    file,
    cb
  ) => {

    cb(null, uploadPath);
  },

  filename: (
    req,
    file,
    cb
  ) => {

    const safeName =
      file.originalname.replace(
        /\s+/g,
        "-"
      );

    cb(
      null,
      Date.now() +
        "-" +
        safeName
    );
  },
});

/* ===============================
   FILE FILTER
================================ */

function fileFilter(
  req,
  file,
  cb
) {

  const allowed = [

    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/avif",
  ];

  if (
    allowed.includes(file.mimetype)
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Only image files allowed"
      ),
      false
    );
  }
}

/* ===============================
   MULTER
================================ */

const upload = multer({

  storage,

  fileFilter,

  limits: {

    fileSize:
      10 * 1024 * 1024,
  },
});

/* ===============================
   ROUTE
================================ */

router.post(

  "/image-ai",

  upload.single("image"),

  analyzeImage
);

export default router;