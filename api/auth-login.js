/**
 * MPIN login (Vercel serverless function).
 *
 * Verifies phone + 4-digit MPIN against the bcrypt hash in `credentials`, with
 * brute-force protection: after 5 wrong tries the account locks for 15 minutes
 * (a 4-digit PIN is only 10,000 combos, so this online lockout is essential).
 * On success it mints a Firebase custom token to sign the browser in.
 *
 * Requires env: FIREBASE_SERVICE_ACCOUNT.
 */
import admin from "firebase-admin";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

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
  if (!db) return res.status(503).json({ error: "Login is not configured" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const phone = String(body.phone || "").replace(/\D/g, "");
    const mpin = String(body.mpin || "");

    if (!/^[6-9]\d{9}$/.test(phone) || !/^\d{4}$/.test(mpin)) {
      return res.status(400).json({ error: "Enter your mobile number and 4-digit MPIN" });
    }

    const uid = "ph_" + phone;
    const credRef = db.collection("credentials").doc(uid);
    const snap = await credRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: "No account found for this number. Please sign up." });
    }

    const c = snap.data();
    const now = Date.now();
    if (c.lockedUntil && c.lockedUntil > now) {
      const mins = Math.ceil((c.lockedUntil - now) / 60000);
      return res.status(423).json({ error: `Too many wrong attempts. Try again in ${mins} minute(s).` });
    }

    if (!bcrypt.compareSync(mpin, c.mpinHash || "")) {
      const fails = (c.failedAttempts || 0) + 1;
      const update = { failedAttempts: fails };
      if (fails >= MAX_ATTEMPTS) { update.lockedUntil = now + LOCK_MS; update.failedAttempts = 0; }
      await credRef.update(update);
      const left = MAX_ATTEMPTS - fails;
      return res.status(401).json({
        error: left > 0 ? `Incorrect MPIN. ${left} attempt(s) left.` : "Too many wrong attempts. Locked for 15 minutes.",
      });
    }

    // Success — clear the counters and issue a token.
    await credRef.update({ failedAttempts: 0, lockedUntil: 0 });
    const token = await admin.auth().createCustomToken(uid);
    return res.status(200).json({ token });
  } catch (e) {
    console.error("auth-login:", e && e.message);
    return res.status(500).json({ error: "Could not log you in. Please try again." });
  }
}
