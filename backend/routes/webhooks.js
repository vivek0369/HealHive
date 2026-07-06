import express from "express";
import Stripe from "stripe";
import Doctor from "../models/Doctor.js";

const router = express.Router();

// Initialize Stripe
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Webhook endpoint for Stripe
// Note: We use express.raw() specifically for this route so Stripe can verify the signature
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe) {
      console.error("Stripe is not configured");
      return res.status(500).send("Stripe not configured");
    }
    
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return res.status(500).send("Webhook secret not configured");
    }

    const sig = req.headers["stripe-signature"];
    let event;

    try {
      // Construct the event using the raw body, signature, and webhook secret
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error(`❌ Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log(`💰 PaymentIntent status: ${paymentIntent.status}`);

      const { doctorId, consultationId, patientUid } = paymentIntent.metadata || {};

      if (doctorId && consultationId) {
        try {
          const doctor = await Doctor.findById(doctorId);
          if (doctor) {
            const entry = (doctor.interestedPatients || []).find(
              (p) => p.consultationId === consultationId
            );

            if (entry) {
              if (!entry.paid) {
                entry.paid = true;
                entry.paidAt = new Date();
                await doctor.save();
                console.log(
                  `✅ Webhook: Payment confirmed for consultation ${consultationId} (Doctor: ${doctor.fullName})`
                );
              } else {
                console.log(`ℹ️ Webhook: Consultation ${consultationId} already marked as paid.`);
              }
            } else {
              console.warn(
                `⚠️ Webhook: Consultation entry not found for ID ${consultationId}`
              );
            }
          } else {
            console.warn(`⚠️ Webhook: Doctor not found for ID ${doctorId}`);
          }
        } catch (dbErr) {
          console.error(`❌ Webhook DB Error: ${dbErr.message}`);
          // Do not fail the webhook request if DB errors out, 
          // but consider retries or dead-letter queues in a production app.
        }
      } else {
        console.warn("⚠️ Webhook: Missing doctorId or consultationId in metadata");
      }
    } else {
      console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  }
);

export default router;
