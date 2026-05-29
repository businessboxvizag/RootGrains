import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../home/Home.css";

const mockNotifications = [
  { id: 1, icon: "🎉", title: "Order Delivered!", body: "Your order #RG240501 has been delivered successfully.", time: "2 days ago", read: false },
  { id: 2, icon: "🛵", title: "Out for Delivery", body: "Your Sona Masoori 2kg order is on its way!", time: "3 days ago", read: false },
  { id: 3, icon: "✅", title: "Order Confirmed", body: "Order #RG240428 has been confirmed and is being processed.", time: "5 days ago", read: true },
  { id: 4, icon: "🌾", title: "New Millets Arrived!", body: "Fresh Little Millet (Samalu) now available. Order now!", time: "1 week ago", read: true },
  { id: 5, icon: "🎁", title: "Free Delivery on All Orders", body: "Enjoy free delivery on all orders this week!", time: "1 week ago", read: true },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "#fff", position: "sticky", top: 0, zIndex: 100, boxShadow: "var(--shadow-sm)", borderBottom: "1px solid var(--border)" }}>
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span style={{ fontSize: "17px", fontWeight: "700", color: "var(--brown-dark)", fontFamily: "var(--font-display)", flex: 1 }}>Notifications</span>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ background: "none", border: "none", fontSize: "12px", fontWeight: "700", color: "var(--gold)", cursor: "pointer" }}>
            Mark all read
          </button>
        )}
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <div style={{ padding: "10px 14px 0" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", background: "var(--gold-pale)", color: "var(--brown)", padding: "4px 12px", borderRadius: "var(--radius-full)" }}>
            {unreadCount} unread
          </span>
        </div>
      )}

      {/* Notification List */}
      <div style={{ padding: "12px 0 30px" }}>
        {notifications.map(n => (
          <div key={n.id} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
            style={{ display: "flex", gap: "14px", padding: "14px 16px", background: n.read ? "#fff" : "var(--gold-pale)", borderBottom: "1px solid var(--cream-3)", cursor: "pointer" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: n.read ? "var(--cream-2)" : "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
              {n.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3px" }}>
                <p style={{ fontSize: "14px", fontWeight: n.read ? "500" : "700", color: "var(--brown-dark)" }}>{n.title}</p>
                {!n.read && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--gold)", flexShrink: 0, marginTop: "4px" }} />}
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "4px" }}>{n.body}</p>
              <p style={{ fontSize: "11px", color: "var(--text-faint)" }}>{n.time}</p>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔔</div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
