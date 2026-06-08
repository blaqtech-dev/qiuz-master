import express from "express";

import {
  verifyPayment,
} from "../aicontroller/paymentcontroller.js";

const router =
  express.Router();

router.post(
  "/verify-payment",
  verifyPayment
);

export default router;