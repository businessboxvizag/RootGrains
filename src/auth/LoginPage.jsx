import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../home/Home.css";
import { useAuth } from "./AuthContext";

const inp = {
  width: "100%", padding: "13px 14px",
  border: "1.5px solid var(--border)", borderRadius: "12px",
  fontSize: "15px", color: "var(--text)", background: "var(--cream-2)",
  outline: "none", fontFamily: "var(--font-body)", boxSizing: "border-box",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithMpin } = useAuth();
  const from = location.state?.from || "/profile";

  const [phone, setPhone] = useState("");
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pinRefs = [useRef(), useRef(), useRef(), useRef()];
  const mpinCode = mpin.join("");

  const handlePinChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...mpin]; next[i] = val; setMpin(next); setError("");
    if (val && i < 3) pinRefs[i + 1].current?.focus();
  };
  const handlePinKeyDown = (i, e) => {
    if (e.key === "Backspace" && !mpin[i] && i > 0) pinRefs[i - 1].current?.focus();
    if (e.key === "Enter") handleLogin();
  };

  const handleLogin = async () => {
    setError("");
    if (!phone.match(/^[6-9]\d{9}$/)) { setError("Enter a valid 10-digit mobile number."); return; }
    if (mpinCode.length !== 4) { setError("Enter your 4-digit MPIN."); return; }
    setLoading(true);
    try {
      await loginWithMpin(phone, mpinCode);
      navigate(from);
    } catch (e) {
      setError(e.message || "Login failed. Please try again.");
      setMpin(["", "", "", ""]);
      setTimeout(() => pinRefs[0].current?.focus(), 50);
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", borderBottom: "1px solid var(--border)" }}>
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span style={{ fontSize: 17, fontWeight: 700, color: "var(--brown-dark)", fontFamily: "var(--font-display)" }}>Sign In</span>
      </div>

      {/* Branding */}
      <div style={{ background: "var(--brown-dark)", padding: "30px 24px 26px", textAlign: "center" }}>
        <img src="/logo.png" alt="Root Grains" style={{ width: 60, height: 60, objectFit: "contain", margin: "0 auto 12px", display: "block" }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Root Grains</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>Log in with your mobile number & MPIN</p>
      </div>

      <div style={{ padding: "26px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Phone */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Mobile Number</label>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ ...inp, width: "auto", padding: "13px 14px", background: "#f0ece8", color: "var(--brown-dark)", fontWeight: 700, flexShrink: 0, borderRadius: 12 }}>+91</div>
            <input style={{ ...inp, flex: 1 }} type="tel" inputMode="numeric" maxLength={10}
              value={phone}
              onChange={e => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
              placeholder="10-digit number" autoFocus />
          </div>
        </div>

        {/* MPIN */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, display: "block" }}>4-Digit MPIN</label>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {mpin.map((d, i) => (
              <input key={i} ref={pinRefs[i]} type="password" inputMode="numeric" maxLength={1} value={d}
                onChange={e => handlePinChange(i, e.target.value)}
                onKeyDown={e => handlePinKeyDown(i, e)}
                style={{ width: 52, height: 58, textAlign: "center", fontSize: 24, fontWeight: 800, color: "var(--brown-dark)",
                  border: `2px solid ${d ? "var(--brown-dark)" : "var(--border)"}`, borderRadius: 12, background: "#fff", outline: "none", fontFamily: "var(--font-body)" }} />
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#c0392b", fontWeight: 500 }}>{error}</div>
        )}

        <button onClick={handleLogin} disabled={loading}
          style={{ width: "100%", padding: 14, background: loading ? "var(--brown)" : "var(--brown-dark)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Signing in…" : "Log In →"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
          New customer?{" "}
          <span onClick={() => navigate("/signup", { state: { from } })} style={{ color: "var(--brown-dark)", fontWeight: 700, cursor: "pointer" }}>Create an account</span>
        </p>
      </div>
    </div>
  );
}
