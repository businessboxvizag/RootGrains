import { useState } from "react";
import { useAdminAuth } from "./AdminAuthContext";
import "../home/Home.css";

export default function AdminLoginPage() {
  const { login, error, setError } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    try {
      await login(email, password);
    } catch (_) {}
    setLoading(false);
  };

  const inp = { width: "100%", padding: "12px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "14px", color: "var(--text)", background: "var(--cream-2)", outline: "none", fontFamily: "var(--font-body)", boxSizing: "border-box" };
  const lbl = { fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px", display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--brown-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "36px 32px", width: "100%", maxWidth: "400px", margin: "0 16px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <img src="/logo.png" alt="Root Grains" style={{ width: "56px", height: "56px", objectFit: "contain", marginBottom: "12px" }} />
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "var(--brown-dark)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Root Grains</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Admin Panel</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={lbl}>Email Address</label>
            <input style={inp} type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="admin@rootgrains.com" autoComplete="email" />
          </div>
          <div>
            <label style={lbl}>Password</label>
            <input style={inp} type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="Enter your password" autoComplete="current-password" />
          </div>

          {error && (
            <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#c0392b", fontWeight: "500" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "var(--text-faint)" : "var(--brown-dark)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", marginTop: "4px" }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "11px", color: "var(--text-faint)", marginTop: "20px" }}>
          Root Grains Admin · Powered by BusinessBOX
        </p>
      </div>
    </div>
  );
}
