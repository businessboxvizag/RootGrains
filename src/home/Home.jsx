import { useState, useEffect } from "react";
import "./Home.css";
import Header from "./Header";
import Hero from "./Hero";
import Brands from "./Brands";
import Categories from "./Categories";
import Products from "./Products";
import BottomNav from "./BottomNav";
import OffersSection from "./OffersSection";
import { useLang } from "../LanguageContext";
import { getBanners } from "../services/firestore";

const VIZAG_PINCODES = new Set([
  516003, 517586, 524312,
  530002, 530003, 530004, 530007, 530008, 530009, 530011, 530012, 530013,
  530016, 530017, 530018, 530022, 530024, 530026, 530027, 530028, 530035,
  530040, 530041, 530043, 530044, 530045, 530046, 530047, 530048, 530049,
  530053,
  531001, 531011, 531019, 531020, 531021, 531022, 531025, 531026, 531031,
  531033, 531035, 531055, 531061, 531111, 531113, 531114, 531116, 531118,
  531126, 531149, 531162, 531163, 531173, 531219,
  532443,
  535005, 535145, 535216, 535240, 535280,
]);

function PincodeModal({ onClose }) {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState(null); // null | "yes" | "no"

  const check = () => {
    const num = parseInt(pincode.trim(), 10);
    if (pincode.trim().length !== 6 || isNaN(num)) {
      setResult("invalid");
      return;
    }
    setResult(VIZAG_PINCODES.has(num) ? "yes" : "no");
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#3b1f0e", marginBottom: 4 }}>Check Delivery</h2>
            <p style={{ fontSize: 12, color: "#888" }}>Enter your pincode to check if we deliver to your area</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa", lineHeight: 1 }}>✕</button>
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={e => { const val = e.target.value.replace(/\D/g, "").slice(0, 6); setPincode(val); setResult(null); }}
            onKeyDown={e => e.key === "Enter" && check()}
            placeholder="e.g. 530017"
            style={{ flex: 1, padding: "11px 14px", border: "1.5px solid #d0c8c0", borderRadius: 12, fontSize: 16, fontWeight: 600, color: "#3b1f0e", outline: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={check}
            style={{ padding: "11px 18px", background: "#3b1f0e", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            Check
          </button>
        </div>

        {/* Result */}
        {result === "yes" && (
          <div style={{ background: "#e8f5e9", border: "1px solid #c8e6c9", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>✅</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#2e7d32", marginBottom: 2 }}>Delivery Available!</p>
              <p style={{ fontSize: 12, color: "#4caf50" }}>We deliver to pincode {pincode}.</p>
            </div>
          </div>
        )}
        {result === "no" && (
          <div style={{ background: "#fff3e0", border: "1px solid #ffe0b2", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>😔</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#e65100", marginBottom: 2 }}>Not Available Yet</p>
              <p style={{ fontSize: 12, color: "#f57c00" }}>We don't deliver to {pincode} yet. We're expanding soon!</p>
            </div>
          </div>
        )}
        {result === "invalid" && (
          <div style={{ background: "#ffebee", border: "1px solid #ffcdd2", borderRadius: 12, padding: "12px 16px" }}>
            <p style={{ fontSize: 13, color: "#c62828", fontWeight: 600 }}>Please enter a valid 6-digit pincode.</p>
          </div>
        )}

        <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 16 }}>
          Currently serving Visakhapatnam district only
        </p>
      </div>
    </div>
  );
}

function Home() {
  const { t } = useLang();
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  // Load live Announcement banners for the notice bar
  useEffect(() => {
    getBanners()
      .then(all => setAnnouncements(all.filter(b => b.active && b.type === "Announcement")))
      .catch(() => {});
  }, []);

  // Build the notice bar scroll content: caution notice + any live announcements
  const noticeItems = [
    t.notice,
    ...announcements.map(a => a.title),
  ];
  const scrollText = noticeItems.join("     ·     ");

  return (
    <div className="mobile">
      <Header />
      <Hero />

      {/* Notice bar */}
      <div className="notice-bar">
        <div className="notice-scroll">
          {scrollText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          {scrollText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </div>
      </div>
      {/* Check here button below, right-aligned */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "4px 10px 2px" }}>
        <button
          onClick={() => setShowPincodeModal(true)}
          style={{ background: "#3b1f0e", border: "none", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer" }}
        >
          Check delivery here →
        </button>
      </div>

      {/* Live offers & promotions from admin panel */}
      <OffersSection />

      <Brands />
      <Categories />
      <Products />

      {/* Footer */}
      <div style={{ background: "#3b1f0e", color: "#fff", padding: "28px 20px 24px", marginBottom: 64 }}>
        {/* Logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <img src="/logo.png" alt="Root Grains" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 8 }} />
          <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)" }}>Root Grains</span>
        </div>

        {/* Address */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Our Store</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
            Ground Floor, 13/24/61, Raythu Bazar Road,<br />
            Near Petrol Bunk, New Gajuwaka,<br />
            Visakhapatnam, Andhra Pradesh
          </p>
        </div>

        {/* Phone */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Contact</p>
          <a href="tel:+916302876180" style={{ fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            📞 +91 63028 76180
          </a>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            Powered by{" "}
            <a
              href="https://www.businessbox.org.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.75)", fontWeight: 700, textDecoration: "none" }}
            >
              BusinessBox
            </a>
          </p>
        </div>
      </div>

      <BottomNav />

      {showPincodeModal && <PincodeModal onClose={() => setShowPincodeModal(false)} />}
    </div>
  );
}

export default Home;
