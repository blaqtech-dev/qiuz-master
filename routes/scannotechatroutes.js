import express from "express";

import {
  chatWithNotes,
}
from "../aicontroller/scannotechatcontroller.js";

const router =
  express.Router();

router.post(

  "/scan-notes-chat",

  chatWithNotes
);

export default router;