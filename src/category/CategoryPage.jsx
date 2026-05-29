import { useParams, useNavigate } from "react-router-dom";
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
    descEN: "Fresh Sona Masoori rice — the daily staple of every Telugu home",
    descTE: "తాజా సోనా మసూరి బియ్యం — ప్రతి తెలుగు ఇంటి నిత్య అవసరం",
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

function QtyControl({ p, t }) {
  const { cart, addToCart, removeFromCart } = useCart();
  const cartItem = cart.find(i => i.id === p.id);
  const qty = cartItem ? cartItem.qty : 0;
  const name = t[p.nameKey] || p.nameKey;
  if (qty === 0) return (
    <button className="add-btn" onClick={e => { e.stopPropagation(); addToCart({ ...p, name, perKg: `₹${p.perKgPrice}/kg` }); }}>+</button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--brown-dark)", borderRadius: "6px", padding: "2px 10px" }} onClick={e => e.stopPropagation()}>
      <button onClick={e => { e.stopPropagation(); removeFromCart(p.id); }} style={{ background: "none", border: "none", color: "#fff", fontSize: "16px", cursor: "pointer" }}>−</button>
      <span style={{ color: "#fff", fontWeight: "700", fontSize: "13px" }}>{qty}</span>
      <button onClick={e => { e.stopPropagation(); addToCart({ ...p, name, perKg: `₹${p.perKgPrice}/kg` }); }} style={{ background: "none", border: "none", color: "#fff", fontSize: "16px", cursor: "pointer" }}>+</button>
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { totalItems } = useCart();

  const meta = categoryMeta[slug];
  const products = allProducts.filter(p => p.category === slug);

  if (!meta) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Category not found.</p>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

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
          <p style={{ fontSize: "11px", fontWeight: "700", color: meta.accent, marginTop: "6px" }}>{products.length} products available</p>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ padding: "14px 12px 100px" }}>
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🌾</div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No products found in this category.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {products.map(p => {
              const name = t[p.nameKey] || p.nameKey;
              return (
                <div key={p.id} className="product-card" onClick={() => navigate(`/product/${p.id}`)} style={{ position: "relative" }}>
                  <div className="card-top">
                    <QtyControl p={p} t={t} />
                  </div>
                  <div className="product-img">
                    <img src={p.img} alt={name} />
                  </div>
                  <span className="weight-badge">{p.weight}</span>
                  <h4>{name}</h4>
                  <p className="price">₹{p.price}</p>
                  <p className="per-kg">₹{p.perKgPrice}/kg</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <GoToCart itemCount={totalItems} />
      <BottomNav />
    </div>
  );
}
