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


    const { data: existingPayment } =
  await supabase
    .from("payments")
    .select("id")
    .eq(
      "reference",
      payment.reference
    )
    .maybeSingle();

if (existingPayment) {
  return res.json({
    success: true,
    plan: "pro",
  });
}

if (
  !payment ||
  payment.status !== "success"
) {
  return res.status(400).json({
    success: false,
    message: "Payment not successful",
  });
}

const {
  data: profile
} = await supabase
  .from("profiles")
  .select("*")
  .eq(
    "email",
    payment.customer.email
  )
  .single();


  if (!profile) {

  return res.status(404).json({
    success:false,
    message:"Profile not found"
  });

}


    await supabase
.from("profiles")
.update({
  plan: "pro"
})
.eq("id", profile.id);

await supabase
.from("payments")
.insert([
  {
    user_id: userId,
    email: payment.customer.email,
    reference: payment.reference,
    amount: payment.amount / 100,
    status: payment.status,
  },
]);

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



export async function paystackWebhook(
  req,
  res
) {
  try {

    const event = req.body;

    if (
      event.event ===
      "charge.success"
    ) {

      const payment =
        event.data;

      const {
        data: profile
      } = await supabase
        .from("profiles")
        .select("*")
        .eq(
          "email",
          payment.customer.email
        )
        .maybeSingle();

      if (profile) {

        const {
          data: existing
        } = await supabase
          .from("payments")
          .select("id")
          .eq(
            "reference",
            payment.reference
          )
          .maybeSingle();

        if (!existing) {

          await supabase
            .from("profiles")
            .update({
              plan: "pro"
            })
            .eq(
              "id",
              profile.id
            );

          await supabase
            .from("payments")
            .insert([
              {
                user_id:
                  profile.id,
                email:
                  payment.customer.email,
                reference:
                  payment.reference,
                amount:
                  payment.amount /
                  100,
                status:
                  payment.status,
              },
            ]);
        }
      }
    }

    return res.sendStatus(200);

  } catch (error) {

    console.log(error);

    return res.sendStatus(500);

  }
}