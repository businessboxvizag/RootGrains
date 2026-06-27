import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../home/Home.css";
import { useAuth } from "./AuthContext";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { saveCustomer } from "../services/firestore";

const inp = {
  width: "100%", padding: "13px 14px",
  border: "1.5px solid var(--border)", borderRadius: "12px",
  fontSize: "15px", color: "var(--text)", background: "var(--cream-2)",
  outline: "none", fontFamily: "var(--font-body)", boxSizing: "border-box",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendPhoneOTP, verifyPhoneOTP, sendEmailLink } = useAuth();
  const from = location.state?.from || "/profile";

  const [method, setMethod] = useState("phone"); // "phone" | "email"
  const [step, setStep] = useState("input");     // "input" | "otp" | "sent" | "name"

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");

  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const recaptchaRef = useRef(null);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // ── Resend countdown ───────────────────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; });
    }, 1000);
  };

  // ── OTP box handlers ───────────────────────────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) otpRefs[i + 1].current?.focus();
  };
  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
    if (e.key === "Enter") handleVerify();
  };
  const otpCode = otp.join("");

  // ── Send phone OTP ─────────────────────────────────────────────────────────
  const handleSendPhoneOTP = async () => {
    setError("");
    if (!phone.match(/^[6-9]\d{9}$/)) { setError("Enter a valid 10-digit mobile number."); return; }
    setLoading(true);
    try {
      const result = await sendPhoneOTP(phone, recaptchaRef.current);
      setConfirmationResult(result);
      setStep("otp");
      startResendTimer();
      setTimeout(() => otpRefs[0].current?.focus(), 200);
    } catch (err) {
      setError(
        err.code === "auth/too-many-requests" ? "Too many attempts. Try again later." :
        err.code === "auth/invalid-phone-number" ? "Invalid phone number." :
        "Could not send OTP. Try again."
      );
    }
    setLoading(false);
  };

  // ── Send email link ────────────────────────────────────────────────────────
  const handleSendEmailLink = async () => {
    setError("");
    if (!email.includes("@") || !email.includes(".")) { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      await sendEmailLink(email);
      setStep("sent");
    } catch (err) {
      setError(
        err.code === "auth/too-many-requests" ? "Too many attempts. Try again later." :
        "Could not send email. Check the address and try again."
      );
    }
    setLoading(false);
  };

  // ── Verify phone OTP ───────────────────────────────────────────────────────
  const handleVerify = async () => {
    setError("");
    if (otpCode.length !== 6) { setError("Enter all 6 digits."); return; }
    setLoading(true);
    try {
      const u = await verifyPhoneOTP(confirmationResult, otpCode);
      if (!u.displayName) { setStep("name"); }
      else { navigate(from); }
    } catch (err) {
      setError(
        err.code === "auth/invalid-verification-code" ? "Wrong code. Check and try again." :
        err.code === "auth/code-expired" ? "Code expired. Request a new one." :
        "Verification failed. Try again."
      );
    }
    setLoading(false);
  };

  // ── Save name for new users ────────────────────────────────────────────────
  const handleSaveName = async () => {
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      await saveCustomer(auth.currentUser.uid, {
        name: name.trim(),
        phone: auth.currentUser.phoneNumber || "",
        email: auth.currentUser.email || "",
        createdAt: new Date(),
      });
      navigate(from);
    } catch { setError("Could not save name. Try again."); }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(["", "", "", "", "", ""]); setError("");
    await handleSendPhoneOTP();
  };

  // ─────────────────────────────────────────────────────────────────────────
  const Header = ({ title = "Sign In" }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", borderBottom: "1px solid var(--border)" }}>
      <button className="back-btn" onClick={() => step === "input" ? navigate(-1) : setStep("input")}>←</button>
      <span style={{ fontSize: 17, fontWeight: 700, color: "var(--brown-dark)", fontFamily: "var(--font-display)" }}>{title}</span>
    </div>
  );

  const Branding = ({ subtitle }) => (
    <div style={{ background: "var(--brown-dark)", padding: "28px 24px 24px", textAlign: "center" }}>
      <img src="/logo.png" alt="Root Grains" style={{ width: 64, height: 64, objectFit: "contain", margin: "0 auto 12px", display: "block" }} />
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Root Grains</h1>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{subtitle}</p>
    </div>
  );

  const ErrorBox = () => error ? (
    <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#c0392b", fontWeight: 500 }}>{error}</div>
  ) : null;

  // ── Name collection ────────────────────────────────────────────────────────
  if (step === "name") return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--cream)", minHeight: "100vh" }}>
      <Header title="Set Up Profile" />
      <Branding subtitle="Almost there — just tell us your name" />
      <div style={{ padding: "28px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Your Name</label>
          <input style={inp} value={name} onChange={e => setName(e.target.value)}
            placeholder="Enter your full name" onKeyDown={e => e.key === "Enter" && handleSaveName()} autoFocus />
        </div>
        <ErrorBox />
        <button onClick={handleSaveName} disabled={loading}
          style={{ width: "100%", padding: 14, background: "var(--brown-dark)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          {loading ? "Saving..." : "Continue →"}
        </button>
      </div>
    </div>
  );

  // ── Email link sent ────────────────────────────────────────────────────────
  if (step === "sent") return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--cream)", minHeight: "100vh" }}>
      <Header />
      <Branding subtitle="Check your email to sign in" />
      <div style={{ padding: "40px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 56 }}>📬</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--brown-dark)" }}>Check your inbox!</h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 280 }}>
          We sent a sign-in link to<br />
          <strong style={{ color: "var(--brown-dark)" }}>{email}</strong>
        </p>
        <p style={{ fontSize: 12, color: "#bbb" }}>Tap the link in the email to log in instantly.<br />Also check your spam folder.</p>
        <button onClick={() => { setStep("input"); setEmail(""); }}
          style={{ marginTop: 8, padding: "10px 24px", background: "var(--cream-2)", color: "var(--brown-dark)", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ← Try a different email
        </button>
      </div>
    </div>
  );

  // ── OTP entry ──────────────────────────────────────────────────────────────
  if (step === "otp") return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--cream)", minHeight: "100vh" }}>
      <Header />
      <Branding subtitle="Enter the OTP sent to your phone" />
      <div style={{ padding: "28px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
          6-digit code sent to <strong style={{ color: "var(--brown-dark)" }}>+91 {phone}</strong>
        </p>

        {/* 6-digit OTP boxes */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {otp.map((digit, i) => (
            <input key={i} ref={otpRefs[i]}
              type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
              style={{
                width: 44, height: 54, textAlign: "center",
                fontSize: 22, fontWeight: 800, color: "var(--brown-dark)",
                border: `2px solid ${digit ? "var(--brown-dark)" : "var(--border)"}`,
                borderRadius: 10, background: "#fff", outline: "none",
                fontFamily: "var(--font-body)",
              }}
            />
          ))}
        </div>

        <ErrorBox />

        <button onClick={handleVerify} disabled={loading || otpCode.length < 6}
          style={{
            width: "100%", padding: 14,
            background: otpCode.length < 6 ? "#c8b89a" : "var(--brown-dark)",
            color: "#fff", border: "none", borderRadius: 12,
            fontSize: 15, fontWeight: 700,
            cursor: otpCode.length < 6 ? "not-allowed" : "pointer",
          }}>
          {loading ? "Verifying..." : "Verify & Sign In →"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          Didn't receive it?{" "}
          {resendTimer > 0
            ? <span style={{ color: "#aaa" }}>Resend in {resendTimer}s</span>
            : <span onClick={handleResend} style={{ color: "var(--brown-dark)", fontWeight: 700, cursor: "pointer" }}>Resend OTP</span>
          }
        </p>
      </div>
      <div ref={recaptchaRef} />
    </div>
  );

  // ── Input screen ───────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--cream)", minHeight: "100vh" }}>
      <Header />
      <Branding subtitle="Sign in or create your account in seconds" />

      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Phone / Email toggle */}
        <div style={{ display: "flex", background: "var(--cream-2)", borderRadius: 12, padding: 4, border: "1.5px solid var(--border)" }}>
          {["phone", "email"].map(m => (
            <button key={m} onClick={() => { setMethod(m); setError(""); }}
              style={{
                flex: 1, padding: "10px 0", border: "none", borderRadius: 9,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: method === m ? "var(--brown-dark)" : "transparent",
                color: method === m ? "#fff" : "var(--text-muted)",
                transition: "all 0.2s",
              }}>
              {m === "phone" ? "📱 Phone OTP" : "✉️ Email Link"}
            </button>
          ))}
        </div>

        {method === "phone" ? (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Mobile Number</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ ...inp, width: "auto", padding: "13px 14px", background: "#f0ece8", color: "var(--brown-dark)", fontWeight: 700, flexShrink: 0, borderRadius: 12 }}>
                +91
              </div>
              <input style={{ ...inp, flex: 1 }}
                type="tel" inputMode="numeric" maxLength={10}
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSendPhoneOTP()}
                placeholder="10-digit number" autoFocus />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>You'll receive a 6-digit OTP via SMS</p>
          </div>
        ) : (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Email Address</label>
            <input style={inp} type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSendEmailLink()}
              placeholder="you@example.com" autoFocus />
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>We'll email you a one-tap sign-in link — no password</p>
          </div>
        )}

        <ErrorBox />

        <button
          onClick={method === "phone" ? handleSendPhoneOTP : handleSendEmailLink}
          disabled={loading}
          style={{ width: "100%", padding: 14, background: loading ? "var(--brown)" : "var(--brown-dark)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading
            ? (method === "phone" ? "Sending OTP..." : "Sending link...")
            : (method === "phone" ? "Send OTP →" : "Send Sign-in Link →")}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7 }}>
          New customer? We'll create your account automatically.
        </p>
      </div>

      {/* Invisible reCAPTCHA — required by Firebase Phone Auth */}
      <div ref={recaptchaRef} />
    </div>
  );
}
