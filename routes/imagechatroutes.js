import express from "express";

import {
  imageTutorChat,
} from "../aicontroller/imagechatcontrollers.js";

const router = express.Router();

router.post(
  "/image-chat",
  imageTutorChat
);

export default router;