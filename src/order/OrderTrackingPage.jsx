import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../home/Home.css";
import { useLang } from "../LanguageContext";

const steps = [
  { key: "orderPlaced", icon: "📋", time: "Just now" },
  { key: "confirmed", icon: "✅", time: "In 15 min" },
  { key: "dispatched", icon: "📦", time: "In 1-2 hrs" },
  { key: "outForDelivery", icon: "🛵", time: "In 2-4 hrs" },
  { key: "delivered", icon: "🏠", time: "By today" },
];

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLang();
  const order = location.state || {};
  const activeStep = 0; // Order just placed — step 0 complete

  const now = new Date();
  const orderDate = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const slotLabels = { morning: t.morning, afternoon: t.afternoon, evening: t.evening };

  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "#fff", position: "sticky", top: 0, zIndex: 100, boxShadow: "var(--shadow-sm)", borderBottom: "1px solid var(--border)" }}>
        <button className="back-btn" onClick={() => navigate("/")}>←</button>
        <span style={{ fontSize: "17px", fontWeight: "700", color: "var(--brown-dark)", fontFamily: "var(--font-display)" }}>{t.trackOrder}</span>
      </div>

      {/* Order confirmed card */}
      <div style={{ background: "var(--olive)", margin: "14px", borderRadius: "var(--radius-lg)", padding: "20px 18px", color: "#fff" }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎉</div>
        <p style={{ fontSize: "18px", fontWeight: "700", marginBottom: "4px", fontFamily: "var(--font-display)" }}>Order Placed Successfully!</p>
        <p style={{ fontSize: "13px", opacity: 0.85 }}>We've received your order and will confirm it shortly.</p>
        <div style={{ display: "flex", gap: "20px", marginTop: "14px" }}>
          <div><p style={{ fontSize: "10px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.orderId}</p><p style={{ fontSize: "13px", fontWeight: "700" }}>{orderId}</p></div>
          <div><p style={{ fontSize: "10px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.orderDate}</p><p style={{ fontSize: "13px", fontWeight: "700" }}>{orderDate}</p></div>
          <div><p style={{ fontSize: "10px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.estimatedDelivery}</p><p style={{ fontSize: "13px", fontWeight: "700" }}>Today</p></div>
        </div>
      </div>

      {/* Delivery slot */}
      {order.slot && (
        <div style={{ background: "#fff", margin: "0 14px 14px", borderRadius: "var(--radius-md)", padding: "14px 16px", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--brown-dark)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>{t.deliverySlot}</p>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>🕒 {slotLabels[order.slot] || order.slot}</p>
          {order.form && <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>📍 {order.form.address}, {order.form.city}</p>}
        </div>
      )}

      {/* Timeline */}
      <div style={{ background: "#fff", margin: "0 14px 14px", borderRadius: "var(--radius-md)", padding: "18px 16px", border: "1px solid var(--border)" }}>
        <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--brown-dark)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "18px" }}>Delivery Status</p>
        {steps.map((step, i) => {
          const done = i <= activeStep;
          const current = i === activeStep;
          return (
            <div key={step.key} style={{ display: "flex", gap: "14px", marginBottom: i < steps.length - 1 ? "0" : "0" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: done ? "var(--olive)" : "var(--cream-3)", border: `2px solid ${done ? "var(--olive)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0, zIndex: 1 }}>
                  {done ? (current ? step.icon : "✓") : step.icon}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: "2px", height: "36px", background: done ? "var(--olive)" : "var(--border)", margin: "2px 0" }} />
                )}
              </div>
              <div style={{ paddingTop: "6px", paddingBottom: "10px" }}>
                <p style={{ fontSize: "14px", fontWeight: current ? "700" : "600", color: done ? "var(--brown-dark)" : "var(--text-faint)" }}>{t[step.key]}</p>
                <p style={{ fontSize: "11px", color: done ? "var(--olive)" : "var(--text-faint)", marginTop: "2px" }}>{step.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order items */}
      {order.items && order.items.length > 0 && (
        <div style={{ background: "#fff", margin: "0 14px 14px", borderRadius: "var(--radius-md)", padding: "16px", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--brown-dark)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>{t.orderSummary}</p>
          {order.items.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>
              <span>{item.name} {item.weight} × {item.qty}</span>
              <span style={{ fontWeight: "600", color: "var(--text)" }}>₹{item.price * item.qty}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--border)", marginTop: "10px", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: "700", color: "var(--brown-dark)" }}>
            <span>{t.toPay} ({order.payment === "cod" ? t.cod : t.online})</span>
            <span>₹{order.subtotal}</span>
          </div>
        </div>
      )}

      {/* WhatsApp support */}
      <div style={{ margin: "0 14px 30px" }}>
        <a href="https://wa.me/919999999999?text=Hi, I need help with my order" target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", background: "#e8f5e9", borderRadius: "var(--radius-md)", border: "1px solid #c8e6c9", textDecoration: "none" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          <div>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#1b5e20" }}>{t.whatsapp}</p>
            <p style={{ fontSize: "11px", color: "#4caf50" }}>For order queries & support</p>
          </div>
        </a>
      </div>

      <div style={{ padding: "0 14px 30px" }}>
        <button onClick={() => navigate("/")} style={{ width: "100%", padding: "14px", background: "var(--brown-dark)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "var(--font-body)" }}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
