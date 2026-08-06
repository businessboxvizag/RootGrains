/**
 * Create a Razorpay order server-side (Vercel serverless function).
 *
 * The browser must NOT create the order or hold the key secret. It POSTs the
 * amount here; we create the order with the secret and return the order_id the
 * Razorpay Checkout widget needs. Verification happens in api/razorpay-verify.js.
 *
 * Required Vercel env vars:
 *   RAZORPAY_KEY_ID      — live/test key id (rzp_live_… / rzp_test_…)
 *   RAZORPAY_KEY_SECRET  — the matching key secret (server-only, never exposed)
 *
 * No-ops with 503 if keys are absent, so a COD-only deploy is unaffected.
 */
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
const instance = keyId && keySecret ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!instance) return res.status(503).json({ error: "Online payments are not configured" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const amount = Math.round(Number(body.amount));
    if (!amount || amount < 1) return res.status(400).json({ error: "A valid amount (in INR) is required" });

    const order = await instance.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: "rg_" + Date.now(),
      notes: { source: "rootgrains-web" },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId, // publishable — safe to send to the browser
    });
  } catch (e) {
    console.error("razorpay-order:", e && e.message);
    return res.status(500).json({ error: "Failed to create payment order" });
  }
}
