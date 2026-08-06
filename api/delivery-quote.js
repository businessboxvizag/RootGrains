/**
 * Distance-based delivery quote (Vercel serverless function).
 *
 * The browser POSTs the customer's delivery address; we geocode it, measure the
 * distance from the store, and return the delivery fee from Root Grains' slab
 * table. This is the CUSTOMER-FACING fee (the owner's pricing). It is separate
 * from what Saardha charges the business at dispatch — that stays distance-based
 * on Saardha's side.
 *
 * Slab table (set by the owner):
 *   0–2 km  → ₹20     6–8 km  → ₹50
 *   2–4 km  → ₹30     >8 km   → ₹60, +₹10 per extra 2 km, capped at ₹100
 *   4–6 km  → ₹40
 *
 * Store pickup coordinates come from env (STORE_LAT / STORE_LNG); defaults point
 * to New Gajuwaka, Visakhapatnam. If geocoding fails, a flat fallback fee is
 * returned with estimated:true so checkout never blocks.
 */

// Store (pickup) location — override in Vercel env if the store moves.
const STORE_LAT = Number(process.env.STORE_LAT || 17.6780);
const STORE_LNG = Number(process.env.STORE_LNG || 83.2050);

// Straight-line distance underestimates road distance; nudge it up a little.
const ROAD_FACTOR = 1.3;
const FALLBACK_FEE = 40; // used when the address can't be geocoded

function haversineKm(la1, lo1, la2, lo2) {
  const R = 6371, toR = (d) => (d * Math.PI) / 180;
  const dLa = toR(la2 - la1), dLo = toR(lo2 - lo1);
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(toR(la1)) * Math.cos(toR(la2)) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function feeForKm(km) {
  if (km == null) return { fee: FALLBACK_FEE, estimated: true };
  if (km <= 2) return { fee: 20 };
  if (km <= 4) return { fee: 30 };
  if (km <= 6) return { fee: 40 };
  if (km <= 8) return { fee: 50 };
  // >8 km: ₹60, then +₹10 per additional 2 km, capped at ₹100.
  const tier = Math.ceil((km - 8) / 2);
  return { fee: Math.min(100, 60 + (tier - 1) * 10) };
}

async function geocode(query) {
  const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=" +
    encodeURIComponent(query);
  const res = await fetch(url, {
    headers: { "User-Agent": "RootGrains/1.0 (delivery quote)" },
  });
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { address = "", city = "", pincode = "" } = body;
    const query = [address, city, pincode, "Visakhapatnam", "Andhra Pradesh"].filter(Boolean).join(", ");

    let drop = null;
    try { drop = await geocode(query); } catch { drop = null; }

    if (!drop) {
      // Couldn't locate the address — return a flat estimate so checkout works.
      return res.status(200).json({ fee: FALLBACK_FEE, distanceKm: null, estimated: true });
    }

    const straight = haversineKm(STORE_LAT, STORE_LNG, drop.lat, drop.lng);
    const km = Math.round(straight * ROAD_FACTOR * 10) / 10;
    const { fee, estimated } = feeForKm(km);
    return res.status(200).json({ fee, distanceKm: km, estimated: !!estimated });
  } catch (e) {
    console.error("delivery-quote:", e && e.message);
    return res.status(200).json({ fee: FALLBACK_FEE, distanceKm: null, estimated: true });
  }
}
