import { useNavigate } from "react-router-dom";
import "../home/Home.css";
import { useLang } from "../LanguageContext";
import { allProducts } from "../data/products";
import BottomNav from "../home/BottomNav";

const allBrands = [
  {
    slug: "india-gate",
    name: "India Gate",
    img: "/Brands/indiagate.png",
    descEN: "India's most trusted basmati rice brand — premium quality since 1993",
    descTE: "భారతదేశంలో అత్యంత విశ్వసనీయమైన బాస్మతి బ్రాండ్",
    categories: ["basmati"],
    color: "#f1f8e9",
    accent: "#558b2f",
    tag: "Premium Basmati",
  },
  {
    slug: "daawat",
    name: "Daawat",
    img: "/Brands/daawat.png",
    descEN: "Finest aged basmati rice — loved across Indian kitchens",
    descTE: "ఉత్తమ నాణ్యత గల పాత బాస్మతి బియ్యం",
    categories: ["basmati"],
    color: "#f1f8e9",
    accent: "#558b2f",
    tag: "Aged Basmati",
  },
  {
    slug: "kohinoor",
    name: "Kohinoor",
    img: "/Brands/kohinoor.png",
    descEN: "Premium rice collection — basmati and specialty varieties",
    descTE: "ప్రీమియం బియ్యం సేకరణ — బాస్మతి మరియు ప్రత్యేక రకాలు",
    categories: ["basmati", "non-basmati"],
    color: "#f1f8e9",
    accent: "#558b2f",
    tag: "Multi-variety",
  },
  {
    slug: "unity",
    name: "Unity",
    img: "/Brands/unity.png",
    descEN: "Local Visakhapatnam brand — fresh Sona Masoori & millets direct from farms",
    descTE: "విశాఖపట్నం స్థానిక బ్రాండ్ — తాజా సోనా మసూరి & చిరుధాన్యాలు",
    categories: ["non-basmati", "millets"],
    color: "#f1f8e9",
    accent: "#558b2f",
    tag: "Local & Fresh",
  },
];

export default function BrandsPage() {
  const navigate = useNavigate();
  const { lang } = useLang();

  return (
    <div className="mobile" style={{ background: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "10px 14px", background: "#fff",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "var(--shadow-sm)", borderBottom: "1px solid var(--border)"
      }}>
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span style={{ fontSize: "17px", fontWeight: "700", color: "var(--brown-dark)", fontFamily: "var(--font-display)" }}>
          All Brands
        </span>
        <span style={{
          marginLeft: "auto", fontSize: "11px", fontWeight: "600",
          color: "var(--text-muted)", background: "var(--cream-2)",
          padding: "3px 10px", borderRadius: "var(--radius-full)",
          border: "1px solid var(--border)"
        }}>
          {allBrands.length} Brands
        </span>
      </div>

      {/* Subtitle */}
      <div style={{ padding: "14px 16px 6px" }}>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Browse our trusted brand partners — tap any brand to explore their full range.
        </p>
      </div>

      {/* Brand Cards */}
      <div style={{ padding: "6px 12px 100px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {allBrands.map((brand) => {
          const productCount = allProducts.filter(p => brand.categories.includes(p.category)).length;
          const desc = lang === "TE" ? brand.descTE : brand.descEN;

          return (
            <div
              key={brand.slug}
              onClick={() => navigate(`/brand/${brand.slug}`)}
              style={{
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid var(--border)",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(61,31,10,0.06)",
                transition: "box-shadow 0.2s",
              }}
            >
              {/* Coloured top strip */}
              <div style={{
                background: brand.color,
                padding: "18px 16px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                borderBottom: `2px solid ${brand.accent}22`,
              }}>
                {/* Logo box */}
                <div style={{
                  width: "70px", height: "70px", flexShrink: 0,
                  background: "#fff", borderRadius: "12px",
                  padding: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img src={brand.img} alt={brand.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>

                {/* Brand info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--brown-dark)", fontFamily: "var(--font-display)" }}>
                      {brand.name}
                    </h3>
                    <span style={{
                      fontSize: "9px", fontWeight: "700", color: brand.accent,
                      background: `${brand.accent}18`, padding: "2px 8px",
                      borderRadius: "var(--radius-full)", border: `1px solid ${brand.accent}44`,
                      textTransform: "uppercase", letterSpacing: "0.5px",
                    }}>
                      {brand.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "8px" }}>
                    {desc}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: brand.accent }}>
                      {productCount} products
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-faint)" }}>
                      {brand.categories.map(c =>
                        c === "basmati" ? "Basmati" : c === "non-basmati" ? "Non-Basmati" : "Millets"
                      ).join(" · ")}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand.accent} strokeWidth="2.5" flexShrink="0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>

              {/* Bottom strip — category tags */}
              <div style={{
                padding: "10px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {brand.categories.map(c => (
                    <span key={c} style={{
                      fontSize: "10px", fontWeight: "600", color: "var(--text-muted)",
                      background: "var(--cream-2)", padding: "3px 10px",
                      borderRadius: "var(--radius-full)", border: "1px solid var(--border)",
                    }}>
                      {c === "basmati" ? " Basmati" : c === "non-basmati" ? " Non-Basmati" : " Millets"}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: "11px", color: brand.accent, fontWeight: "700" }}>
                  Shop →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
