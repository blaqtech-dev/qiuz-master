import axios from "axios";
import { supabase } from "../supabase.js";

export async function verifyPayment(req, res) {
  try {
    const { reference, userId } = req.body;

    if (!reference || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing reference or userId",
      });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const payment = response.data.data;

    if (!payment || payment.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment not successful",
      });
    }

    await supabase
      .from("profiles")
      .update({ plan: "pro" })
      .eq("id", userId);

    return res.json({
      success: true,
      plan: "pro",
    });

  } catch (error) {
    console.log("VERIFY ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
}