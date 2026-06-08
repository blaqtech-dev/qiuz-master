import axios from "axios";
import { supabase } from "../supabase.js";

export async function verifyPayment(
  req,
  res
) {

  try {

    const {
      reference,
      userId,
    } = req.body;

    const response =
      await axios.get(

        `https://api.paystack.co/transaction/verify/${reference}`,

        {
          headers: {
            Authorization:
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

    const payment =
      response.data.data;

    if (
      payment.status !==
      "success"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Payment not successful",
      });
    }

    const { error } =
      await supabase

        .from("profiles")

        .update({

          plan: "pro",
        })

        .eq(
          "id",
          userId
        );

    if (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,
      });
    }

    return res.json({

      success: true,

      plan: "pro",
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      success: false,

      message:
        "Verification failed",
    });
  }
}