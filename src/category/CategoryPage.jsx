import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../home/Home.css";
import { useLang } from "../LanguageContext";
import { useCart } from "../CartContext";
import { allProducts } from "../data/products";
import BottomNav from "../home/BottomNav";
import GoToCart from "../components/GoToCart";

const categoryMeta = {
  "basmati": {
    titleKey: "basmatiSection",
    descEN: "Long grain, aromatic rice — perfect for biryanis & pulaos",
    descTE: "సుగంధభరిత బాస్మతి బియ్యం — బిర్యానీ & పులావ్ కోసం అనువైనది",
    img: "/categories/basmati.png",
    color: "#fff8e1",
    accent: "#f57f17",
  },
  "non-basmati": {
    titleKey: "nonBasmatiSection",
    descEN: "Fresh rice — the daily staple of every Telugu home",
    descTE: "తాజా బియ్యం — ప్రతి తెలుగు ఇంటి నిత్య అవసరం",
    img: "/categories/nonbasmati.png",
    color: "#fbe9e7",
    accent: "#bf360c",
  },
  "millets": {
    titleKey: "milletsSection",
    descEN: "Nutritious native millets — foxtail, pearl, finger & little millet",
    descTE: "పోషకాలతో నిండిన స్థానిక చిరుధాన్యాలు — కొర్రలు, సజ్జలు, రాగులు & సామలు",
    img: "/categories/millets.png",
    color: "#f1f8e9",
    accent: "#558b2f",
  },
};

const NON_BASMATI_SUBCATS = [
  { key: "all",           labelEN: "All",           labelTE: "అన్నీ" },
  { key: "sona-masoorie", labelEN: "Sona Masoorie", labelTE: "సోనా మసూరి" },
  { key: "steam-rice",    labelEN: "Steam Rice",    labelTE: "స్టీమ్ రైస్" },
  { key: "raw-rice",      labelEN: "Raw Rice",      labelTE: "రా రైస్" },
  { key: "half-boiled",   labelEN: "Half Boiled",   labelTE: "హాఫ్ బాయిల్డ్" },
];

// Groups products by nameKey, returns array of { nameKey, variants[] }
function groupByName(products) {
  const map = new Map();
  products.forEach(p => {
    if (!map.has(p.nameKey)) map.set(p.nameKey, []);
    map.get(p.nameKey).push(p);
  });
  return Array.from(map.entries()).map(([nameKey, variants]) => ({ nameKey, variants }));
}

// Single product card with weight dropdown
function ProductCard({ nameKey, variants, t, navigate }) {
  const { cart, addToCart, removeFromCart } = useCart();
  const [selectedId, setSelectedId] = useState(variants[0].id);

  const selected = variants.find(v => v.id === selectedId) || variants[0];
  const cartItem = cart.find(i => i.id === selected.id);
  const qty = cartItem ? cartItem.qty : 0;
  const name = t[nameKey] || nameKey;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart({ ...selected, name, perKg: `₹${selected.perKgPrice}/kg` });
  };
  const handleRemove = (e) => {
    e.stopPropagation();
    removeFromCart(selected.id);
  };

  return (
    <div
      onClick={() => navigate(`/product/${selected.id}`)}
      style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", cursor: "pointer", display: "flex", flexDirection: "column" }}
    >
      {/* Image */}
      <div style={{ background: "#f7f3ef", height: "140px", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px" }}>
        <img src={selected.img} alt={name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
      </div>

      {/* Info */}
      <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--brown-dark)", lineHeight: 1.3, margin: 0 }}>{name}</h4>

        {/* Weight dropdown */}
        <div
          onClick={e => e.stopPropagation()}
          style={{ position: "relative" }}
        >
          <select
            value={selectedId}
            onChange={e => { e.stopPropagation(); setSelectedId(e.target.value); }}
            style={{
              width: "100%", padding: "5px 24px 5px 8px", border: "1.5px solid var(--border)",
              borderRadius: "20px", fontSize: "11px", fontWeight: "600", color: "var(--brown-dark)",
              background: "#fff", cursor: "pointer", appearance: "none", WebkitAppearance: "none",
              fontFamily: "var(--font-body)",
            }}
          >
            {variants.map(v => (
              <option key={v.id} value={v.id}>
                {v.weight}  (₹{v.perKgPrice}/kg)
              </option>
            ))}
          </select>
          {/* Chevron icon */}
          <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "10px", color: "var(--brown-dark)" }}>▾</span>
        </div>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{ fontSize: "16px", fontWeight: "800", color: "#e65100" }}>₹{selected.price}</span>
          <span style={{ fontSize: "10px", color: "#aaa" }}>₹{selected.perKgPrice}/kg</span>
        </div>

        {/* Add / Qty control */}
        <div onClick={e => e.stopPropagation()} style={{ marginTop: "auto" }}>
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              style={{ width: "100%", padding: "8px 0", background: "var(--brown-dark)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
            >
              <span style={{ fontSize: "16px" }}>+</span> Add
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--brown-dark)", borderRadius: "8px", padding: "4px 8px" }}>
              <button onClick={handleRemove} style={{ background: "none", border: "none", color: "#fff", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}>−</button>
              <span style={{ color: "#fff", fontWeight: "800", fontSize: "14px" }}>{qty}</span>
              <button onClick={handleAdd} style={{ background: "none", border: "none", color: "#fff", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { totalItems } = useCart();
  const [activeSub, setActiveSub] = useState("all");

  const meta = categoryMeta[slug];
  const isNonBasmati = slug === "non-basmati";

  if (!meta) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Category not found.</p>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  const allCatProducts = allProducts.filter(p => p.category === slug);

  // Filter by sub-category if non-basmati
  const filteredProducts = isNonBasmati && activeSub !== "all"
    ? allCatProducts.filter(p => p.subCategory === activeSub)
    : allCatProducts;

  const groups = groupByName(filteredProducts);

  const title = t[meta.titleKey] || meta.titleKey;
  const desc = lang === "TE" ? meta.descTE : meta.descEN;

  return (
    <div className="mobile" style={{ background: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "#fff", position: "sticky", top: 0, zIndex: 100, boxShadow: "var(--shadow-sm)", borderBottom: "1px solid var(--border)" }}>
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span style={{ fontSize: "17px", fontWeight: "700", color: "var(--brown-dark)", fontFamily: "var(--font-display)" }}>{title}</span>
      </div>

      {/* Category Hero Banner */}
      <div style={{ background: meta.color, padding: "18px 16px 14px", display: "flex", alignItems: "center", gap: "16px", borderBottom: `2px solid ${meta.accent}22` }}>
        <img src={meta.img} alt={title} style={{ width: "64px", height: "64px", objectFit: "contain", flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--brown-dark)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>{title}</h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>{desc}</p>
          <p style={{ fontSize: "11px", fontWeight: "700", color: meta.accent, marginTop: "6px" }}>{allCatProducts.length} products available</p>
        </div>
      </div>

      {/* Sub-category tabs (non-basmati only) */}
      {isNonBasmati && (
        <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", overflowX: "auto", display: "flex", gap: "0", padding: "0 4px" }}>
          {NON_BASMATI_SUBCATS.map(sub => {
            const label = lang === "TE" ? sub.labelTE : sub.labelEN;
            const isActive = activeSub === sub.key;
            return (
              <button
                key={sub.key}
                onClick={() => setActiveSub(sub.key)}
                style={{
                  flexShrink: 0, padding: "12px 14px", border: "none", background: "none",
                  fontSize: "13px", fontWeight: isActive ? "800" : "500",
                  color: isActive ? "var(--brown-dark)" : "var(--text-muted)",
                  borderBottom: isActive ? `2px solid var(--brown-dark)` : "2px solid transparent",
                  cursor: "pointer", fontFamily: "var(--font-body)", whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Products Grid */}
      <div style={{ padding: "14px 12px 120px" }}>
        {groups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🌾</div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No products found.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {groups.map(({ nameKey, variants }) => (
              <ProductCard
                key={nameKey + variants[0].subCategory}
                nameKey={nameKey}
                variants={variants}
                t={t}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>

      <GoToCart itemCount={totalItems} />
      <BottomNav />
    </div>
  );
}
