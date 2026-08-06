/**
 * Verify a Razorpay Checkout callback (Vercel serverless function).
 *
 * After payment, Razorpay's browser callback returns razorpay_order_id,
 * razorpay_payment_id and razorpay_signature. The signature is an HMAC-SHA256
 * of "order_id|payment_id" keyed with the key secret. We recompute it here and
 * compare in constant time — this is what proves the payment is real. Only if
 * it matches does the client finalise the order as paid.
 *
 * Required Vercel env var:
 *   RAZORPAY_KEY_SECRET
 */
import crypto from "crypto";

const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

function verifySignature(orderId, paymentId, signature) {
  if (!keySecret || !orderId || !paymentId || !signature) return false;
  const expected = crypto.createHmac("sha256", keySecret).update(orderId + "|" + paymentId).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!keySecret) return res.status(503).json({ error: "Online payments are not configured" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { orderId, paymentId, signature } = body;
    const ok = verifySignature(orderId, paymentId, signature);
    if (!ok) return res.status(400).json({ ok: false, error: "Payment signature verification failed" });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("razorpay-verify:", e && e.message);
    return res.status(500).json({ ok: false, error: "Verification error" });
  }
}
