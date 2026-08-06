# Root Grains — Go-Live Runbook

Everything needed to take Root Grains to production: web store on Vercel, Android
APK, and live Saardha delivery. Follow the steps in order. Payments (Razorpay)
are intentionally last — they wait on the PAN.

Current state (done in this session):
- Offers/discount UI finished; analytics permission bug fixed; build verified.
- Firestore rules corrected (analytics writes).
- Android (Capacitor) project generated at `android/`.
- Saardha delivery webhook receiver added at `api/sardha-webhook.js`.

---

## A. Commit both repos

**Root Grains** (this repo) — close any open Git tool first, then:

```
git add -A
git commit -m "Finish offers UI + auth merge; fix analytics rules; add Android project + Saardha webhook receiver"
```

**Saardha** — no code changes were needed there; it's already deployed on Render.

---

## B. Deploy the Firestore rules (Root Grains → kbr-app-9991a)

The analytics fix only takes effect once the rules are deployed:

```
firebase deploy --only firestore:rules
```

(`.firebaserc` is already set to `kbr-app-9991a`. If the CLI isn't installed:
`npm install -g firebase-tools && firebase login` first.)

Alternatively: Firebase console → Firestore → Rules → paste `firestore.rules` → Publish.

---

## C. Provision "Root Grains" as a Saardha delivery partner

This issues the API key Root Grains uses to request deliveries.

1. Log in to the **Saardha admin panel** (the admin PWA on your Saardha domain).
2. Go to **Partners → "Create partner + issue key"**.
3. Fill in:
   - **Name:** `Root Grains`
   - **Webhook URL:** `https://<your-rootgrains-domain>/api/sardha-webhook?token=<SECRET>`
     (pick a long random `<SECRET>` now — you'll reuse it in Step E.)
   - **Pricing:** `priceBase`, `pricePerKm`, `priceMin` (defaults 20 / 8 / 25 INR).
4. **Copy the `sk_live_…` API key shown in the popup — it is shown only once.**

---

## D. Configure Root Grains to use Saardha (`settings/sardha`)

In the Firebase console for **kbr-app-9991a** → Firestore → create/edit document
`settings/sardha` (this doc is writable only by the BusinessBox superadmin —
`businessboxvizag@gmail.com` — per the rules):

```json
{
  "enabled": true,
  "apiKey": "sk_live_...(from step C)...",
  "storePickup": {
    "name": "Root Grains Store",
    "phone": "+91XXXXXXXXXX",
    "address": "<store street address>, Visakhapatnam, Andhra Pradesh",
    "lat": 17.6868,
    "lng": 83.2185
  }
}
```

- `enabled: false` is the BusinessBox **kill switch** — flip it to instantly
  suspend delivery dispatch from the admin dashboard.
- **Get the real `lat`/`lng`:** open Google Maps, right-click the store location,
  click the coordinates to copy them. (The values above are placeholder Vizag
  coordinates — replace them.)

---

## E. Wire up the webhook (live delivery tracking)

So delivery status (picked up → out for delivery → delivered) flows to the
customer's tracking page automatically.

In **Vercel → Root Grains project → Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | The full service-account JSON for kbr-app-9991a, on one line. Get it from Firebase console → Project Settings → Service accounts → **Generate new private key**. |
| `SARDHA_WEBHOOK_SECRET` | The same `<SECRET>` you used in the webhook URL in Step C. |

Redeploy after adding them. The endpoint no-ops safely if these are missing, so
it never breaks a deploy.

---

## F. Deploy the Root Grains web store

Push to the branch Vercel tracks (or `vercel --prod`). Vercel builds the Vite app
**and** deploys `api/sardha-webhook.js` as a serverless function automatically.

Smoke test after deploy:
- Store loads, products/brands show, discounts render.
- Place a test order (Cash on Delivery — online pay is "Coming soon" until Step H).
- In admin, dispatch that order via Saardha; confirm a delivery is created and a
  rider is (or isn't) assigned.
- Advance the delivery status in Saardha; confirm the customer's tracking page
  updates on its own (that's the webhook working).

---

## G. Build the Android APK

The `android/` project is generated and synced. Build it **on your machine**
(needs **JDK 17** and the Android SDK — Android Studio bundles both):

```
# from the repo root, after any web change:
npm install
npm run build
npx cap sync android

# debug APK (for testing):
cd android
./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

For a **release** APK/AAB (Play Store), create a keystore and sign it:
`./gradlew assembleRelease` (or `bundleRelease` for the Play Store `.aab`).
App id is `com.rootgrains.app`, version 1.0 (versionCode 1) — bump these in
`android/app/build.gradle` for each release.

Tip: opening the `android/` folder in **Android Studio** and pressing Run is the
easiest path for the first build.

---

## H. Payments (Razorpay) — built; just add your keys

The secure Razorpay flow is now fully implemented and needs no code changes —
only the keys as env vars once your Razorpay account is activated (PAN):

- `api/razorpay-order.js` — creates the Razorpay order server-side (holds the secret).
- `api/razorpay-verify.js` — verifies the payment signature (HMAC-SHA256, constant-time).
- `src/checkout/CheckoutPage.jsx` — creates the order, opens Checkout with the
  server `order_id`, and **verifies the signature server-side before marking the
  order paid**. This closes the "client-only verification" security gap.

**To turn it on, add these env vars in Vercel** (Settings → Environment Variables):

| Name | Scope | Value |
|------|-------|-------|
| `VITE_RAZORPAY_KEY_ID` | Build (client) | Your Key ID, `rzp_live_…` (or `rzp_test_…` to test). Publishable — safe in the browser. |
| `RAZORPAY_KEY_ID` | Server | Same Key ID. |
| `RAZORPAY_KEY_SECRET` | Server | The Key **secret** — server-only, never commit or expose. |

Redeploy after adding them. The "Online Payment" option auto-enables when
`VITE_RAZORPAY_KEY_ID` is a valid `rzp_…` key; otherwise it shows "Coming soon"
and Cash on Delivery keeps working. Test with `rzp_test_…` keys first (use
Razorpay's test card `4111 1111 1111 1111`) before switching to live keys.

---

## Quick reference

| Item | Value |
|------|-------|
| Root Grains Firebase | `kbr-app-9991a` |
| Android app id | `com.rootgrains.app` |
| Saardha partner API | `https://sardha.onrender.com/api/partner` |
| Webhook endpoint | `POST /api/sardha-webhook?token=<SECRET>` |
| Kill switch | `settings/sardha.enabled` (Firestore) |
