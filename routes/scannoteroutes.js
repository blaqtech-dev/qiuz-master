import express from "express";

import multer from "multer";

import path from "path";

import fs from "fs";

import {
  analyzeNotes,
}
from "../aicontroller/scannotecontroller.js";

const router =
  express.Router();

const uploadPath =
  path.join(
    process.cwd(),
    "uploads"
  );

if (
  !fs.existsSync(
    uploadPath
  )
) {

  fs.mkdirSync(
    uploadPath,
    { recursive:true }
  );
}

const storage =
  multer.diskStorage({

    destination:
      (req,file,cb)=>{

        cb(
          null,
          uploadPath
        );
      },

    filename:
      (req,file,cb)=>{

        cb(
          null,

          Date.now() +
          "-" +
          file.originalname
        );
      },
  });

const upload =
  multer({

    storage,

    limits:{

      fileSize:
      10*1024*1024,
    },
  });

router.post(

  "/scan-notes",

 upload.array(
  "images",
  30
),

  analyzeNotes
);

export default router;