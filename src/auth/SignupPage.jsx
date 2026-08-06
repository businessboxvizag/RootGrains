import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../home/Home.css";
import { useAuth } from "./AuthContext";

const inp = {
  width: "100%", padding: "12px 14px",
  border: "1.5px solid var(--border)", borderRadius: "12px",
  fontSize: "15px", color: "var(--text)", background: "var(--cream-2)",
  outline: "none", fontFamily: "var(--font-body)", boxSizing: "border-box",
};
const label = { fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, display: "block" };

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signupWithMpin } = useAuth();
  const from = location.state?.from || "/profile";

  const [f, setF] = useState({
    name: "", email: "", phone: "",
    house: "", area: "", city: "Visakhapatnam", pincode: "",
    mpin: "", confirm: "",
  });
  const [coords, setCoords] = useState(null);   // { lat, lng }
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => {
    let v = e.target.value;
    if (k === "phone") v = v.replace(/\D/g, "").slice(0, 10);
    if (k === "pincode") v = v.replace(/\D/g, "").slice(0, 6);
    if (k === "mpin" || k === "confirm") v = v.replace(/\D/g, "").slice(0, 4);
    setF(s => ({ ...s, [k]: v })); setError("");
  };

  const useMyLocation = () => {
    setError("");
    if (!navigator.geolocation) { setError("Location isn't supported on this device."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) }); setLocating(false); },
      () => { setError("Couldn't get your location. Please allow location access, or we'll use your address."); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSignup = async () => {
    setError("");
    if (!f.name.trim()) return setError("Please enter your name.");
    if (!f.phone.match(/^[6-9]\d{9}$/)) return setError("Enter a valid 10-digit mobile number.");
    if (f.email && !(f.email.includes("@") && f.email.includes("."))) return setError("Enter a valid email (or leave it blank).");
    if (!f.house.trim() || !f.area.trim()) return setError("Please enter your delivery address.");
    if (!f.pincode.match(/^\d{6}$/)) return setError("Enter a valid 6-digit pincode.");
    if (f.mpin.length !== 4) return setError("Set a 4-digit MPIN.");
    if (f.mpin !== f.confirm) return setError("MPIN and confirm MPIN don't match.");

    setLoading(true);
    try {
      await signupWithMpin({
        name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone,
        mpin: f.mpin,
        address: {
          label: "Home",
          address: `${f.house.trim()}, ${f.area.trim()}`,
          city: f.city.trim() || "Visakhapatnam",
          pincode: f.pincode,
          ...(coords || {}),
        },
      });
      navigate(from);
    } catch (e) {
      setError(e.message || "Could not create your account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10 }}>
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span style={{ fontSize: 17, fontWeight: 700, color: "var(--brown-dark)", fontFamily: "var(--font-display)" }}>Create Account</span>
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 460, margin: "0 auto" }}>
        <div>
          <label style={label}>Full Name *</label>
          <input style={inp} value={f.name} onChange={set("name")} placeholder="Your full name" autoFocus />
        </div>

        <div>
          <label style={label}>Mobile Number *</label>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ ...inp, width: "auto", background: "#f0ece8", color: "var(--brown-dark)", fontWeight: 700, flexShrink: 0 }}>+91</div>
            <input style={{ ...inp, flex: 1 }} type="tel" inputMode="numeric" value={f.phone} onChange={set("phone")} placeholder="10-digit number" />
          </div>
        </div>

        <div>
          <label style={label}>Email (optional)</label>
          <input style={inp} type="email" value={f.email} onChange={set("email")} placeholder="you@example.com" />
        </div>

        {/* Address */}
        <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "var(--brown-dark)", marginBottom: 10 }}>Delivery Address</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={label}>House / Flat / Building *</label>
              <input style={inp} value={f.house} onChange={set("house")} placeholder="e.g. 13/24/61, Ground Floor" />
            </div>
            <div>
              <label style={label}>Area / Street / Landmark *</label>
              <input style={inp} value={f.area} onChange={set("area")} placeholder="e.g. Raythu Bazar Road, New Gajuwaka" />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={label}>City *</label>
                <input style={inp} value={f.city} onChange={set("city")} placeholder="City" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={label}>Pincode *</label>
                <input style={inp} type="tel" inputMode="numeric" value={f.pincode} onChange={set("pincode")} placeholder="6-digit" />
              </div>
            </div>

            {/* Exact location capture */}
            <button type="button" onClick={useMyLocation} disabled={locating}
              style={{ padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${coords ? "#2e7d32" : "var(--brown-dark)"}`,
                background: coords ? "#e8f5e9" : "#fff", color: coords ? "#2e7d32" : "var(--brown-dark)",
                fontSize: 13, fontWeight: 700, cursor: locating ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              📍 {locating ? "Getting location…" : coords ? `Location captured (${coords.lat}, ${coords.lng})` : "Use my current location (for accurate delivery)"}
            </button>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: -4 }}>
              This pins your exact spot so the delivery rider finds you easily. Optional but recommended.
            </p>
          </div>
        </div>

        {/* MPIN */}
        <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "var(--brown-dark)", marginBottom: 10 }}>Set your MPIN</p>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>4-Digit MPIN *</label>
              <input style={{ ...inp, letterSpacing: 6, textAlign: "center", fontWeight: 800 }} type="password" inputMode="numeric" value={f.mpin} onChange={set("mpin")} placeholder="••••" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Confirm MPIN *</label>
              <input style={{ ...inp, letterSpacing: 6, textAlign: "center", fontWeight: 800 }} type="password" inputMode="numeric" value={f.confirm} onChange={set("confirm")} placeholder="••••" />
            </div>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>You'll use your mobile number + this MPIN to log in next time. Keep it secret.</p>
        </div>

        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#c0392b", fontWeight: 500 }}>{error}</div>
        )}

        <button onClick={handleSignup} disabled={loading}
          style={{ width: "100%", padding: 15, background: loading ? "var(--brown)" : "var(--brown-dark)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Creating account…" : "Create Account & Continue →"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
          Already have an account?{" "}
          <span onClick={() => navigate("/login", { state: { from } })} style={{ color: "var(--brown-dark)", fontWeight: 700, cursor: "pointer" }}>Log in</span>
        </p>
      </div>
    </div>
  );
}
