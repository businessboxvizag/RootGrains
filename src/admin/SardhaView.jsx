import { useState, useEffect } from "react";
import { getSardhaSettings, updateOrderSardha, updateOrderStatus } from "../services/firestore";
import { sardhaQuote, sardhaCreateDelivery, sardhaGetStatus, geocodeAddress } from "../services/sardha";

const SARDHA_STATUS_COLORS = {
  ACCEPTED:        { bg: "#fff3e0", color: "#e65100" },
  ASSIGNED:        { bg: "#e3f2fd", color: "#1565c0" },
  PICKED_UP:       { bg: "#f3e5f5", color: "#6a1b9a" },
  OUT_FOR_DELIVERY:{ bg: "#fff8e1", color: "#f57f17" },
  DELIVERED:       { bg: "#e8f5e9", color: "#2e7d32" },
  CANCELLED:       { bg: "#ffebee", color: "#c62828" },
};

function StatusBadge({ status }) {
  const c = SARDHA_STATUS_COLORS[status] || { bg: "#f0ece8", color: "#888" };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.color }}>
      {(status || "ACCEPTED").replace(/_/g, " ")}
    </span>
  );
}

// ── Suspended / disabled screen ────────────────────────────────────────────────
function ServiceSuspended() {
  return (
    <div style={{ textAlign: "center", padding: "80px 40px" }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>🚫</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#3b1f0e", marginBottom: 10 }}>
        Saardha Delivery Unavailable
      </h2>
      <p style={{ fontSize: 14, color: "#888", maxWidth: 380, margin: "0 auto 24px", lineHeight: 1.7 }}>
        The Saardha delivery integration has been suspended.
        Contact <strong>BusinessBox</strong> to reactivate this service.
      </p>
      <a href="https://www.businessbox.org.in/" target="_blank" rel="noopener noreferrer"
        style={{ display: "inline-block", padding: "10px 24px", background: "#3b1f0e", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
        Contact BusinessBox →
      </a>
    </div>
  );
}

// ── Dispatch modal ─────────────────────────────────────────────────────────────
function DispatchModal({ order, apiKey, storePickup, onClose, onDispatched }) {
  const [stage, setStage] = useState("quoting"); // "quoting" | "quoted" | "dispatching" | "error"
  const [quote, setQuote] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuote() {
      try {
        const drop = await geocodeAddress(
          `${order.address}, ${order.city}, ${order.pincode}`
        );
        setDropCoords(drop);
        const q = await sardhaQuote(apiKey, storePickup, drop);
        setQuote(q);
        setStage("quoted");
      } catch (e) {
        setError(e.message);
        setStage("error");
      }
    }
    fetchQuote();
  }, []);

  const handleConfirm = async () => {
    setStage("dispatching");
    setError("");
    try {
      const delivery = await sardhaCreateDelivery(apiKey, {
        reference: order.id,
        pickup: {
          ...storePickup,
          phone: storePickup.phone || "+916302876180",
        },
        drop: {
          name: order.customerName,
          phone: order.customerPhone?.startsWith("+91")
            ? order.customerPhone
            : "+91" + (order.customerPhone || ""),
          address: `${order.address}, ${order.city} - ${order.pincode}`,
          ...dropCoords,
        },
        items: order.items?.map(i => `${i.qty}x ${i.name} ${i.weight}`).join(", ") || "Grains order",
        orderValue: order.total,
        paymentType: order.payment === "cod" ? "COD" : "PREPAID",
      });

      await updateOrderSardha(order.id, {
        sardhaDeliveryId: delivery.deliveryId,
        sardhaStatus: delivery.status,
        sardhaTrackingUrl: delivery.trackingUrl,
        sardhaFee: delivery.fee,
        sardhaRider: delivery.rider || null,
      });

      // Promote order to "dispatched"
      await updateOrderStatus(order.id, "dispatched");

      onDispatched(delivery);
    } catch (e) {
      setError(e.message);
      setStage("quoted"); // let them retry
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: "32px 28px", width: 440, maxWidth: "92vw", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#3b1f0e", marginBottom: 4 }}>
          🛵 Dispatch via Saardha
        </h3>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 20 }}>
          Order #{order.id.slice(-8).toUpperCase()}
        </p>

        {/* Order summary */}
        <div style={{ background: "#f5f0ea", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#3b1f0e", marginBottom: 4 }}>{order.customerName}</div>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
            {order.address}, {order.city} — {order.pincode}<br />
            📞 {order.customerPhone} · ₹{order.total} · {order.payment?.toUpperCase()}
          </div>
        </div>

        {/* Quote loading */}
        {stage === "quoting" && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#888", fontSize: 13 }}>
            📍 Getting delivery quote from Saardha...
          </div>
        )}

        {/* Quote result */}
        {quote && (stage === "quoted" || stage === "dispatching") && (
          <div style={{ background: "#e8f5e9", borderRadius: 10, padding: "18px", marginBottom: 20, display: "flex", gap: 16 }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#2e7d32" }}>{quote.distanceKm} km</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Distance</div>
            </div>
            <div style={{ width: 1, background: "#c8e6c9" }} />
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#2e7d32" }}>₹{quote.fee}</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Delivery Fee</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#c62828", marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} disabled={stage === "dispatching"}
            style={{ flex: 1, padding: 12, background: "#f0ece8", color: "#3b1f0e", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={stage !== "quoted"}
            style={{ flex: 1, padding: 12, background: stage === "quoted" ? "#2e7d32" : "#bbb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: stage === "quoted" ? "pointer" : "not-allowed" }}>
            {stage === "dispatching" ? "Dispatching..." : "Confirm & Dispatch →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main SardhaView ────────────────────────────────────────────────────────────
export default function SardhaView({ orders }) {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [statusMap, setStatusMap] = useState({}); // deliveryId → live status data
  const [refreshing, setRefreshing] = useState(null); // deliveryId being refreshed

  useEffect(() => {
    getSardhaSettings()
      .then(s => { setSettings(s); setLoadingSettings(false); })
      .catch(() => setLoadingSettings(false));
  }, []);

  if (loadingSettings) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#aaa", fontSize: 14 }}>
        Loading Saardha settings...
      </div>
    );
  }

  // Kill switch — BB can flip settings/sardha.enabled = false
  if (!settings || !settings.enabled) return <ServiceSuspended />;

  const { apiKey, storePickup } = settings;

  // Orders confirmed but not yet handed to Saardha
  const readyOrders = orders.filter(o => o.status === "confirmed" && !o.sardhaDeliveryId);

  // Orders that have an active Saardha delivery
  const sardhaOrders = orders.filter(o => o.sardhaDeliveryId);

  const handleRefreshStatus = async (order) => {
    setRefreshing(order.sardhaDeliveryId);
    try {
      const live = await sardhaGetStatus(apiKey, order.sardhaDeliveryId);
      setStatusMap(prev => ({ ...prev, [order.sardhaDeliveryId]: live }));
      // Sync status back to Firestore order
      await updateOrderSardha(order.id, { sardhaStatus: live.status });
      if (live.status === "DELIVERED") {
        await updateOrderStatus(order.id, "delivered");
      }
    } catch (e) {
      console.error("Sardha status check failed:", e.message);
    }
    setRefreshing(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#3b1f0e", marginBottom: 2 }}>🛵 Saardha Delivery</h2>
          <p style={{ fontSize: 12, color: "#aaa" }}>Last-mile delivery managed by Saardha's rider fleet</p>
        </div>
        <a href="https://www.businessbox.org.in/" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11, color: "#888", background: "#f0ece8", padding: "5px 14px", borderRadius: 20, textDecoration: "none", fontWeight: 600 }}>
          Powered by BusinessBox
        </a>
      </div>

      {/* Ready to dispatch */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#3b1f0e", marginBottom: readyOrders.length ? 16 : 0 }}>
          📦 Ready to Dispatch
          <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: "#888", background: "#f0ece8", padding: "2px 8px", borderRadius: 10 }}>
            {readyOrders.length}
          </span>
        </h3>

        {readyOrders.length === 0 ? (
          <p style={{ color: "#bbb", fontSize: 13, marginTop: 8 }}>
            No confirmed orders waiting for dispatch. Orders appear here once confirmed.
          </p>
        ) : readyOrders.map(order => (
          <div key={order.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #f5f0ea" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#3b1f0e" }}>{order.customerName}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                #{order.id.slice(-8).toUpperCase()} · {order.address}, {order.city}
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                ₹{order.total} · {order.payment?.toUpperCase()} · {order.items?.length || 0} items
              </div>
            </div>
            <button onClick={() => setDispatchOrder(order)}
              style={{ padding: "9px 18px", background: "#3b1f0e", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              Dispatch →
            </button>
          </div>
        ))}
      </div>

      {/* Active Saardha deliveries */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#3b1f0e", marginBottom: sardhaOrders.length ? 16 : 0 }}>
          🛵 Active Deliveries
          <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: "#888", background: "#f0ece8", padding: "2px 8px", borderRadius: 10 }}>
            {sardhaOrders.length}
          </span>
        </h3>

        {sardhaOrders.length === 0 ? (
          <p style={{ color: "#bbb", fontSize: 13, marginTop: 8 }}>
            No active Saardha deliveries yet.
          </p>
        ) : sardhaOrders.map(order => {
          const live = statusMap[order.sardhaDeliveryId];
          const status = live?.status || order.sardhaStatus || "ACCEPTED";
          const isRefreshing = refreshing === order.sardhaDeliveryId;
          return (
            <div key={order.id} style={{ padding: "14px 0", borderBottom: "1px solid #f5f0ea" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#3b1f0e" }}>{order.customerName}</span>
                    <StatusBadge status={status} />
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    #{order.id.slice(-8).toUpperCase()} · Rider: {live?.riderAssigned || order.sardhaRider ? (order.sardhaRider || "Assigned") : "Awaiting"}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    Fee: ₹{order.sardhaFee || "—"} · {order.address}, {order.city}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleRefreshStatus(order)} disabled={isRefreshing}
                    style={{ padding: "6px 12px", background: "#f0ece8", color: "#3b1f0e", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {isRefreshing ? "..." : "↻ Refresh"}
                  </button>
                  {order.sardhaTrackingUrl && (
                    <a href={order.sardhaTrackingUrl} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "6px 12px", background: "#3b1f0e", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                      Track →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dispatch modal */}
      {dispatchOrder && (
        <DispatchModal
          order={dispatchOrder}
          apiKey={apiKey}
          storePickup={storePickup}
          onClose={() => setDispatchOrder(null)}
          onDispatched={() => setDispatchOrder(null)}
        />
      )}
    </div>
  );
}
