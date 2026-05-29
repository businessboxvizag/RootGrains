import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../home/Home.css";
import { useLang } from "../LanguageContext";

const mockAddresses = [
  { id: 1, label: "Home", name: "Stanley David", address: "12-3-4, Dwaraka Nagar, Lane 5", city: "Visakhapatnam", pincode: "530016", phone: "9876543210", isDefault: true },
];

export default function SavedAddressesPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [addresses, setAddresses] = useState(mockAddresses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "Home", name: "", address: "", city: "Visakhapatnam", pincode: "", phone: "" });

  const inp = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleAdd = () => {
    if (!form.name || !form.address || !form.pincode) return;
    setAddresses(prev => [...prev, { ...form, id: Date.now(), isDefault: false }]);
    setShowForm(false);
    setForm({ label: "Home", name: "", address: "", city: "Visakhapatnam", pincode: "", phone: "" });
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-sm)", fontSize: "14px", color: "var(--text)",
    background: "var(--cream-2)", outline: "none", fontFamily: "var(--font-body)",
    boxSizing: "border-box",
  };
  const labelStyle = { fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "5px", display: "block" };

  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "#fff", position: "sticky", top: 0, zIndex: 100, boxShadow: "var(--shadow-sm)", borderBottom: "1px solid var(--border)" }}>
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span style={{ fontSize: "17px", fontWeight: "700", color: "var(--brown-dark)", fontFamily: "var(--font-display)", flex: 1 }}>{t.savedAddresses}</span>
        <button onClick={() => setShowForm(true)} style={{ padding: "6px 14px", background: "var(--brown-dark)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
          + Add
        </button>
      </div>

      {/* Address List */}
      <div style={{ padding: "14px 14px 30px" }}>
        {addresses.map(addr => (
          <div key={addr.id} style={{ background: "#fff", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: "12px", border: `1.5px solid ${addr.isDefault ? "var(--gold)" : "var(--border)"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>{addr.label === "Home" ? "🏠" : addr.label === "Work" ? "🏢" : "📍"}</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--brown-dark)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{addr.label}</span>
                {addr.isDefault && <span style={{ fontSize: "10px", background: "var(--gold-pale)", color: "var(--brown)", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: "700" }}>Default</span>}
              </div>
              <button onClick={() => setAddresses(prev => prev.filter(a => a.id !== addr.id))} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: "16px" }}>🗑</button>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text)", fontWeight: "500", marginBottom: "3px" }}>{addr.name}</p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>{addr.address}, {addr.city} — {addr.pincode}</p>
            <p style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "4px" }}>📞 {addr.phone}</p>
          </div>
        ))}

        {addresses.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📍</div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No saved addresses yet.</p>
          </div>
        )}
      </div>

      {/* Add Address Form */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 36px", width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--brown-dark)", fontFamily: "var(--font-display)" }}>Add New Address</span>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-faint)" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
              {["Home", "Work", "Other"].map(lbl => (
                <button key={lbl} onClick={() => setForm(f => ({ ...f, label: lbl }))}
                  style={{ padding: "6px 16px", border: `1.5px solid ${form.label === lbl ? "var(--gold)" : "var(--border)"}`, borderRadius: "var(--radius-full)", background: form.label === lbl ? "var(--gold-pale)" : "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer", color: "var(--text)" }}>
                  {lbl}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label style={labelStyle}>Full Name</label><input style={inputStyle} value={form.name} onChange={inp("name")} placeholder="Full name" /></div>
              <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={form.phone} onChange={inp("phone")} placeholder="10-digit mobile" maxLength={10} /></div>
              <div><label style={labelStyle}>Address</label><textarea style={{ ...inputStyle, height: "70px", resize: "none" }} value={form.address} onChange={inp("address")} placeholder="House no., Street, Area" /></div>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>City</label><input style={{ ...inputStyle, background: "var(--cream-3)", color: "var(--text-muted)" }} value={form.city} readOnly /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Pincode</label><input style={inputStyle} value={form.pincode} onChange={inp("pincode")} placeholder="530001" maxLength={6} /></div>
              </div>
            </div>
            <button onClick={handleAdd} style={{ width: "100%", padding: "14px", background: "var(--brown-dark)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginTop: "16px", fontFamily: "var(--font-body)" }}>
              Save Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
