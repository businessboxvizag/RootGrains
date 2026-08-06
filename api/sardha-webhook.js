/**
 * Saardha delivery status webhook receiver (Vercel serverless function).
 *
 * Saardha POSTs here on every delivery status change (see PARTNER_API.md):
 *   { event, deliveryId, reference, status, fee, at }
 * We look up the matching Root Grains order and update it, so the customer's
 * live order-tracking page (which subscribes to the order doc) reflects the
 * delivery status in real time — no polling needed.
 *
 * Security: Saardha's webhook is an unauthenticated POST, so we require a
 * shared secret in the query string (?token=...) matching SARDHA_WEBHOOK_SECRET.
 *
 * Required Vercel env vars (Project → Settings → Environment Variables):
 *   FIREBASE_SERVICE_ACCOUNT  — the full service-account JSON (one line)
 *   SARDHA_WEBHOOK_SECRET     — a long random string; also put it in the
 *                               webhook URL registered with Saardha.
 *
 * If the env vars are absent the function no-ops safely (503) and never
 * affects the rest of the site.
 */
import admin from "firebase-admin";

// Map Saardha's granular delivery states onto Root Grains' order statuses.
// Everything "in flight" shows as "dispatched" (Out for Delivery) to the customer.
const STATUS_MAP = {
  ACCEPTED: "dispatched",
  ASSIGNED: "dispatched",
  PICKED_UP: "dispatched",
  OUT_FOR_DELIVERY: "dispatched",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Lazily initialise firebase-admin from the service-account env var.
// Returns null (rather than throwing) when unconfigured, so deploys never break.
function getDb() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
  if (!admin.apps.length) {
    const creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // Vercel often stores the private key with literal "\n" — restore real newlines.
    if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, "\n");
    admin.initializeApp({ credential: admin.credential.cert(creds) });
  }
  return admin.firestore();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Shared-secret check — reject anything without the correct token.
  const secret = process.env.SARDHA_WEBHOOK_SECRET;
  if (!secret || req.query.token !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const db = getDb();
  if (!db) {
    return res.status(503).json({ error: "Webhook not configured" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { deliveryId, reference, status, fee } = body;
    if (!status) return res.status(400).json({ error: "Missing status" });

    // Root Grains sets the delivery `reference` to its own order id at dispatch,
    // so a direct doc lookup is the fast path. Fall back to sardhaDeliveryId.
    let ref = null;
    let current = null;
    if (reference) {
      const snap = await db.collection("orders").doc(String(reference)).get();
      if (snap.exists) { ref = snap.ref; current = snap.data(); }
    }
    if (!ref && deliveryId) {
      const q = await db.collection("orders")
        .where("sardhaDeliveryId", "==", String(deliveryId)).limit(1).get();
      if (!q.empty) { ref = q.docs[0].ref; current = q.docs[0].data(); }
    }
    if (!ref) return res.status(404).json({ error: "Order not found" });

    const update = {
      sardhaStatus: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (fee != null) update.sardhaFee = fee;

    // Only advance the customer-facing status; never downgrade a terminal state
    // (a late/out-of-order webhook must not revert delivered/cancelled orders).
    const mapped = STATUS_MAP[status];
    const terminal = current && (current.status === "delivered" || current.status === "cancelled");
    if (mapped && !terminal) update.status = mapped;

    await ref.update(update);
    return res.status(200).json({ ok: true, order: ref.id, status: update.status || current?.status });
  } catch (e) {
    console.error("sardha-webhook:", e && e.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
