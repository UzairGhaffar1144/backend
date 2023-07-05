const express = require("express");
const Stripe = require("stripe");
const { Psychologist } = require("../../models/psychologist");
const { Appointment } = require("../../models/appointment");

require("dotenv").config();
const stripe = Stripe(
  "sk_test_51NQbMRCLYc4Y6uaAQ39t4JT2xnn4fF02YtRgrGdEeUunfmZxvJyG9IOiDg1mxKNuuUAJ67NLl7IOA1J39i6aYRfD00IdplXl9e"
);
const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  const psychologistid = req.body.psychologistId;
  const psychologist = await Psychologist.findById(psychologistid);
  const appointmenttype = "onsite";
  let fee = null;
  if (psychologist) {
    if (appointmenttype == "online") {
      fee = psychologist.onlineAppointment.fee;
    } else if (appointmenttype == "onsite") {
      fee = psychologist.onsiteAppointment.fee;
    }
    console.log(fee);
  }
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "pkr",
          product_data: {
            name: "The ammount that will be cahrged for booking appointment",
          },
          unit_amount: fee * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000/checkout-success",
    cancel_url: "http://localhost:3000/cancel",
  });

  res.send({ url: session.url });
});
router.post("/payment-sheet", async (req, res) => {
  console.log("request");
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2022-11-15" }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: "eur",
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey:
      "pk_test_51NQbMRCLYc4Y6uaAOArfsgZ7oXJlIAg1jZTM0cbFRy1qfacuzbQofc7D2IvSIW63u0ZH5GHEEhQviLXtfx1en7vc00uCvDhVjl",
  });
});

module.exports = router;
