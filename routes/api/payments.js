const express = require("express");
const Stripe = require("stripe");
const { Psychologist } = require("../../models/psychologist");
const { Appointment } = require("../../models/appointment");

require("dotenv").config();
const stripe = Stripe(
  "sk_test_51NDqw8Af90alvTgyqdphXk0oTIAylAcAVL8VsW6xXtdpeZPBJneYYXyPmu9xX5uKudtzDGJzPAwIZpwEIbeyiq8U006sIlMiXC"
);
const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  const psychologistid = "6445177660b37600091742c1";
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
      "pk_test_51NDqw8Af90alvTgyQZuwQihTNE452eyu22MWocwUWYwCqdfRkQTaOuoAeHEHYyFJlVSVhoj4TEjMDbJtHiwKj7kZ00xCXYEanc",
  });
});

module.exports = router;
