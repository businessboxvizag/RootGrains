/**
 * MPIN signup (Vercel serverless function).
 *
 * Creates a Firebase Auth user keyed by phone, stores the customer profile, and
 * saves a bcrypt-hashed 4-digit MPIN in a SEPARATE `credentials` collection that
 * the client can never read (see firestore.rules). Returns a Firebase custom
 * token so the browser signs straight in — no SMS, no reCAPTCHA, no OAuth.
 *
 * Requires env: FIREBASE_SERVICE_ACCOUNT (already set for the Saardha webhook).
 *
 * NOTE: the phone is NOT verified by OTP — anyone can enter any number. That's an
 * accepted tradeoff for this store (delivery is confirmed by call).
 */
import admin from "firebase-admin";
import bcrypt from "bcryptjs";

function parseServiceAccount(raw) {
  let s = (raw || "").trim(); // strip stray leading/trailing whitespace/newlines
  // Accept a base64-encoded JSON too (immune to paste/newline issues).
  if (s && !s.startsWith("{")) {
    try { s = Buffer.from(s, "base64").toString("utf8").trim(); } catch { /* not base64 */ }
  }
  const creds = JSON.parse(s);
  // If the private key came in with literal "\n", restore real newlines.
  if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, "\n");
  return creds;
}

function getDb() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
  return admin.firestore();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const db = getDb();
  if (!db) return res.status(503).json({ error: "Sign-up is not configured" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").replace(/\D/g, "");
    const mpin = String(body.mpin || "");
    const address = body.address || null; // { label, house, area, city, pincode, lat, lng }

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ error: "Enter a valid 10-digit mobile number" });
    if (!/^\d{4}$/.test(mpin)) return res.status(400).json({ error: "MPIN must be 4 digits" });

    const uid = "ph_" + phone;
    const credRef = db.collection("credentials").doc(uid);
    if ((await credRef.get()).exists) {
      return res.status(409).json({ error: "This phone number is already registered. Please log in." });
    }

    // Create the Firebase Auth user (idempotent).
    try {
      await admin.auth().createUser({ uid, displayName: name });
    } catch (e) {
      if (e.code !== "auth/uid-already-exists") throw e;
    }

    const mpinHash = bcrypt.hashSync(mpin, 10);
    const now = admin.firestore.FieldValue.serverTimestamp();

    await credRef.set({ uid, phone, mpinHash, failedAttempts: 0, lockedUntil: 0, createdAt: now });

    const addresses = address
      ? [{ id: Date.now().toString(), name, phone, ...address }]
      : [];
    await db.collection("customers").doc(uid).set({
      name, email, phone, addresses, createdAt: now,
    }, { merge: true });

    const token = await admin.auth().createCustomToken(uid);
    return res.status(200).json({ token });
  } catch (e) {
    console.error("auth-signup:", e && e.message);
    return res.status(500).json({ error: "Could not create your account. Please try again." });
  }
}
