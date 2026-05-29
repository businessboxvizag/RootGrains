import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../admin/AdminAuthContext";
import AdminLoginPage from "../admin/AdminLoginPage";
import { getOrders, getCustomers, getAnalytics } from "../services/firestore";
import "../home/Home.css";

const CLIENTS = [
  { id: "kbr", name: "KBR / Root Grains", category: "Rice & Millets", location: "Visakhapatnam", status: "active", since: "May 2026" },
  // Future clients go here
];

function BBSidebar({ active, setActive, onLogout }) {
  const navigate = useNavigate();
  const nav = [
    { key: "overview", icon: "⚡", label: "Overview" },
    { key: "analytics", icon: "📈", label: "Analytics" },
    { key: "orders", icon: "📦", label: "All Orders" },
    { key: "customers", icon: "👥", label: "All Customers" },
    { key: "clients", icon: "🏢", label: "Clients" },
  ];
  return (
    <div style={{ width: "230px", background: "#0f0f1a", minHeight: "100vh", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, #C8922A, #8B4513)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>⚡</div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: "800", color: "#fff", letterSpacing: "0.3px" }}>BusinessBOX</p>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>Super Admin</p>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 8px" }}>
        {nav.map(n => (
          <div key={n.key} onClick={() => setActive(n.key)}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 12px", borderRadius: "8px", cursor: "pointer", marginBottom: "2px", background: active === n.key ? "rgba(200,146,42,0.15)" : "transparent", color: active === n.key ? "#C8922A" : "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: active === n.key ? "700" : "400", borderLeft: active === n.key ? "3px solid #C8922A" : "3px solid transparent" }}>
            <span style={{ fontSize: "17px" }}>{n.icon}</span>
            {n.label}
          </div>
        ))}
      </nav>
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <button onClick={() => navigate("/admin")} style={{ width: "100%", padding: "9px", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-body)" }}>
          → KBR Admin
        </button>
        <button onClick={onLogout} style={{ width: "100%", padding: "9px", background: "transparent", color: "rgba(255,255,255,0.3)", border: "none", fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-body)" }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, trend, color = "#C8922A" }) {
  return (
    <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "20px 18px", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <span style={{ fontSize: "22px" }}>{icon}</span>
        {trend && <span style={{ fontSize: "11px", color: trend > 0 ? "#4caf50" : "#ef5350", fontWeight: "700" }}>{trend > 0 ? "+" : ""}{trend}%</span>}
      </div>
      <p style={{ fontSize: "26px", fontWeight: "800", color: "#fff", marginBottom: "4px", fontFamily: "var(--font-display)" }}>{value}</p>
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: "500" }}>{label}</p>
    </div>
  );
}

function OverviewView({ orders, customers, analytics }) {
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const todayOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    return d.toDateString() === new Date().toDateString();
  });
  const totalPageViews = analytics?.views?.reduce((s, v) => {
    return s + Object.entries(v.data).filter(([k]) => k !== "date").reduce((a, [, val]) => a + val, 0);
  }, 0) || 0;

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>BusinessBOX Overview</h2>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>All client data in one place — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        <KPICard icon="📦" label="Total Orders" value={orders.length} />
        <KPICard icon="₹" label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} />
        <KPICard icon="👥" label="Total Customers" value={customers.length} />
        <KPICard icon="👁️" label="Page Views (7d)" value={totalPageViews} />
        <KPICard icon="🏢" label="Active Clients" value={CLIENTS.filter(c => c.status === "active").length} />
        <KPICard icon="⏳" label="Pending Orders" value={orders.filter(o => o.status === "pending").length} />
      </div>

      {/* Today's snapshot */}
      <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(200,146,42,0.2)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#C8922A", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px" }}>Today's Activity</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div><p style={{ fontSize: "22px", fontWeight: "800", color: "#fff" }}>{todayOrders.length}</p><p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Orders Today</p></div>
          <div><p style={{ fontSize: "22px", fontWeight: "800", color: "#fff" }}>₹{todayOrders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString("en-IN")}</p><p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Revenue Today</p></div>
          <div><p style={{ fontSize: "22px", fontWeight: "800", color: "#fff" }}>{orders.filter(o => o.status === "pending").length}</p><p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Pending Actions</p></div>
        </div>
      </div>

      {/* Recent orders */}
      <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "700", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px" }}>Latest Orders</h3>
        {orders.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>No orders yet.</p>}
        {orders.slice(0, 6).map((o, i) => (
          <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < Math.min(orders.length, 6) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: "600", color: "#fff", marginBottom: "2px" }}>{o.customerName} <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: "400" }}>· {o.customerPhone}</span></p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{o.city} · {o.slot}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#C8922A" }}>₹{o.total}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "capitalize" }}>{o.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AllOrdersView({ orders }) {
  const [search, setSearch] = useState("");
  const filtered = orders.filter(o =>
    (o.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.customerPhone || "").includes(search) ||
    (o.city || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", gap: "14px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>All Orders <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", fontWeight: "400" }}>({orders.length})</span></h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, city..." style={{ padding: "9px 14px", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "13px", color: "#fff", outline: "none", width: "240px", fontFamily: "var(--font-body)" }} />
      </div>
      <div style={{ background: "#1a1a2e", borderRadius: "12px", overflow: "auto", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 2fr 0.8fr 0.8fr 0.8fr", padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", minWidth: "700px" }}>
          <span>Customer</span><span>Phone</span><span>Items</span><span>Total</span><span>Slot</span><span>Status</span>
        </div>
        {filtered.length === 0 && <p style={{ padding: "24px", color: "rgba(255,255,255,0.3)", textAlign: "center", fontSize: "14px" }}>No orders found.</p>}
        {filtered.map((o, i) => {
          const statusC = { pending: "#f57f17", confirmed: "#1976d2", dispatched: "#7b1fa2", delivered: "#388e3c", cancelled: "#c62828" };
          return (
            <div key={o.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 2fr 0.8fr 0.8fr 0.8fr", padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center", minWidth: "700px" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#fff", marginBottom: "2px" }}>{o.customerName || "—"}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{o.address?.slice(0, 25)}...</p>
              </div>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{o.customerPhone}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{o.items?.map(it => `${it.name} ×${it.qty}`).join(", ").slice(0, 60)}</span>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#C8922A" }}>₹{o.total}</span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>{o.slot}</span>
              <span style={{ fontSize: "11px", fontWeight: "700", color: statusC[o.status] || "#fff", textTransform: "capitalize" }}>{o.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AllCustomersView({ customers }) {
  const [search, setSearch] = useState("");
  const filtered = customers.filter(c =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", gap: "14px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>All Customers <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", fontWeight: "400" }}>({customers.length})</span></h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." style={{ padding: "9px 14px", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "13px", color: "#fff", outline: "none", width: "240px", fontFamily: "var(--font-body)" }} />
      </div>
      <div style={{ background: "#1a1a2e", borderRadius: "12px", overflow: "auto", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr 0.8fr 0.8fr", padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", minWidth: "600px" }}>
          <span>Name</span><span>Phone</span><span>Address</span><span>Orders</span><span>Spend</span>
        </div>
        {filtered.length === 0 && <p style={{ padding: "24px", color: "rgba(255,255,255,0.3)", textAlign: "center", fontSize: "14px" }}>No customers yet.</p>}
        {filtered.map((c, i) => (
          <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr 0.8fr 0.8fr", padding: "14px 16px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center", minWidth: "600px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>{c.name || "—"}</span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{c.phone || "—"}</span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{c.address || "—"}</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{c.orderCount || 0}</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#C8922A" }}>₹{(c.totalSpend || 0).toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientsView() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>Clients</h2>
        <button style={{ padding: "9px 16px", background: "rgba(200,146,42,0.15)", color: "#C8922A", border: "1px solid rgba(200,146,42,0.3)", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "var(--font-body)" }}>+ Add Client</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {CLIENTS.map(c => (
          <div key={c.id} style={{ background: "#1a1a2e", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>{c.name}</span>
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: c.status === "active" ? "rgba(76,175,80,0.15)" : "rgba(255,255,255,0.08)", color: c.status === "active" ? "#4caf50" : "rgba(255,255,255,0.3)", fontWeight: "700" }}>{c.status}</span>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{c.category} · {c.location} · Since {c.since}</p>
            </div>
            <button style={{ padding: "8px 16px", background: "rgba(200,146,42,0.1)", color: "#C8922A", border: "1px solid rgba(200,146,42,0.2)", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "var(--font-body)" }}>View →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BBSuperAdmin() {
  const { user, loading, logout, isBBAdmin } = useAdminAuth();
  const [active, setActive] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user || !isBBAdmin) return;
    Promise.all([getOrders(), getCustomers(), getAnalytics()])
      .then(([o, c, a]) => { setOrders(o); setCustomers(c); setAnalytics(a); setDataLoading(false); });
  }, [user, isBBAdmin]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f1a", color: "#fff" }}>Loading...</div>;
  if (!user) return <AdminLoginPage />;
  if (!isBBAdmin) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f1a", color: "#fff", flexDirection: "column", gap: "12px" }}>
      <p style={{ fontSize: "18px", fontWeight: "700" }}>Access Denied</p>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>This area is restricted to BusinessBOX administrators.</p>
    </div>
  );

  const views = {
    overview: <OverviewView orders={orders} customers={customers} analytics={analytics} />,
    orders: <AllOrdersView orders={orders} />,
    customers: <AllCustomersView customers={customers} />,
    clients: <ClientsView />,
    analytics: <div style={{ color: "rgba(255,255,255,0.5)", padding: "40px", textAlign: "center" }}><p style={{ fontSize: "18px", marginBottom: "8px" }}>📈 Analytics</p><p style={{ fontSize: "14px" }}>Page view tracking will populate here as customers use the app.</p></div>,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-body)", background: "#0f0f1a" }}>
      <BBSidebar active={active} setActive={setActive} onLogout={logout} />
      <div style={{ flex: 1, padding: "28px 32px", overflow: "auto" }}>
        {dataLoading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "rgba(255,255,255,0.3)" }}>Loading all data from Firebase...</div>
        ) : views[active]}
      </div>
    </div>
  );
}
