/**
 * Saardha Delivery API client
 * Base URL: https://sardha.onrender.com/api/partner
 * Auth: x-api-key header (key stored in Firestore settings/sardha — admin-only)
 *
 * NOTE: This integration is controlled by a kill switch in Firestore.
 * BusinessBox can disable it at any time by setting settings/sardha.enabled = false.
 */

const BASE = "https://sardha.onrender.com/api/partner";

async function call(apiKey, method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Saardha API error (HTTP ${res.status})`);
  return json;
}

/** Get a delivery fee quote based on pickup and drop coordinates */
export const sardhaQuote = (apiKey, pickup, drop) =>
  call(apiKey, "POST", "/quote", { pickup, drop });

/** Create a delivery — returns { deliveryId, status, rider, fee, trackingUrl } */
export const sardhaCreateDelivery = (apiKey, payload) =>
  call(apiKey, "POST", "/deliveries", payload);

/** Check the live status of a delivery */
export const sardhaGetStatus = (apiKey, deliveryId) =>
  call(apiKey, "GET", `/deliveries/${deliveryId}`);

/**
 * Geocode a free-text address to { lat, lng } using OpenStreetMap Nominatim.
 * Used to get the customer's drop coordinates for quoting.
 */
export async function geocodeAddress(address) {
  const q = encodeURIComponent(`${address}, Visakhapatnam, Andhra Pradesh, India`);
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`
  );
  const data = await res.json();
  if (!data.length) throw new Error(`Could not locate address: "${address}". Check it and try again.`);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}
