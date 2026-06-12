import express from "express";

import {
  verifyPayment,
  paystackWebhook
} from "../aicontroller/paymentcontroller.js";

const router =
  express.Router();

router.post(
  "/verify-payment",
  verifyPayment
);

router.post(
  "/paystack/webhook",
  paystackWebhook
);
export default router;