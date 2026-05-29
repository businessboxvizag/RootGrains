import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../home/Home.css";
import { useLang } from "../LanguageContext";

export default function LoginPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState("mobile"); // mobile | otp
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (!mobile.match(/^[6-9]\d{9}$/)) { setError("Enter a valid 10-digit mobile number"); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 1200);
  };

  const handleOtpChange = (val, i) => {
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter complete 6-digit OTP"); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate("/profile"); }, 1200);
  };

  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "#fff", boxShadow: "var(--shadow-sm)", borderBottom: "1px solid var(--border)" }}>
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span style={{ fontSize: "17px", fontWeight: "700", color: "var(--brown-dark)", fontFamily: "var(--font-display)" }}>{t.loginTitle}</span>
      </div>

      {/* Brand Hero */}
      <div style={{ background: "var(--brown-dark)", padding: "32px 24px 28px", textAlign: "center" }}>
        <img src="/logo.png" alt="Root Grains" style={{ width: "72px", height: "72px", objectFit: "contain", margin: "0 auto 14px", display: "block" }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "700", color: "#fff", marginBottom: "6px" }}>{t.loginWelcome}</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.70)", lineHeight: 1.5 }}>{t.loginSubtitle}</p>
      </div>

      <div style={{ padding: "24px 20px" }}>
        {step === "mobile" ? (
          <div>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>{t.enterMobile}</p>
            <div style={{ display: "flex", gap: "10px", marginBottom: "6px" }}>
              <div style={{ padding: "11px 12px", background: "var(--cream-2)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "14px", fontWeight: "700", color: "var(--brown-dark)" }}>+91</div>
              <input
                type="tel" maxLength={10} value={mobile}
                onChange={e => { setMobile(e.target.value); setError(""); }}
                placeholder="Enter mobile number"
                style={{ flex: 1, padding: "11px 14px", border: `1.5px solid ${error ? "#e55" : "var(--border)"}`, borderRadius: "var(--radius-sm)", fontSize: "15px", color: "var(--text)", background: "var(--cream-2)", outline: "none", fontFamily: "var(--font-body)" }}
                onKeyDown={e => e.key === "Enter" && handleSendOtp()}
              />
            </div>
            {error && <p style={{ fontSize: "11px", color: "#e55", marginBottom: "10px" }}>{error}</p>}
            <button
              onClick={handleSendOtp} disabled={loading}
              style={{ width: "100%", padding: "14px", background: loading ? "var(--brown)" : "var(--brown-dark)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginTop: "8px", fontFamily: "var(--font-body)" }}>
              {loading ? "Sending..." : t.sendOtp}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>{t.enterOtp}</p>
            <p style={{ fontSize: "12px", color: "var(--text-faint)", marginBottom: "20px" }}>{t.otpSent} +91 {mobile}</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "6px" }}>
              {otp.map((d, i) => (
                <input
                  key={i} id={`otp-${i}`} type="tel" maxLength={1} value={d}
                  onChange={e => handleOtpChange(e.target.value, i)}
                  onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) document.getElementById(`otp-${i - 1}`)?.focus(); }}
                  style={{ width: "44px", height: "50px", textAlign: "center", fontSize: "20px", fontWeight: "700", border: `2px solid ${d ? "var(--gold)" : "var(--border)"}`, borderRadius: "var(--radius-sm)", background: d ? "var(--gold-pale)" : "var(--cream-2)", outline: "none", color: "var(--brown-dark)", fontFamily: "var(--font-body)" }}
                />
              ))}
            </div>
            {error && <p style={{ fontSize: "11px", color: "#e55", marginBottom: "10px", textAlign: "center" }}>{error}</p>}
            <button
              onClick={handleVerify} disabled={loading}
              style={{ width: "100%", padding: "14px", background: loading ? "var(--brown)" : "var(--brown-dark)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginTop: "14px", fontFamily: "var(--font-body)" }}>
              {loading ? "Verifying..." : t.verifyOtp}
            </button>
            <button onClick={() => { setStep("mobile"); setOtp(["", "", "", "", "", ""]); setError(""); }}
              style={{ width: "100%", padding: "12px", background: "transparent", color: "var(--gold)", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginTop: "8px", fontFamily: "var(--font-body)" }}>
              ← Change Number
            </button>
            <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-faint)", marginTop: "12px" }}>
              Didn't receive OTP?{" "}
              <span onClick={() => setStep("mobile")} style={{ color: "var(--gold)", fontWeight: "600", cursor: "pointer" }}>{t.resendOtp}</span>
            </p>
          </div>
        )}

        <div style={{ marginTop: "32px", padding: "16px", background: "var(--cream-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>
            By continuing, you agree to our Terms of Service and Privacy Policy. Your number will only be used for order updates.
          </p>
        </div>
      </div>
    </div>
  );
}
