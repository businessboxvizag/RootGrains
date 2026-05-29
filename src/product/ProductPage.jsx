import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import GoToCart from "../components/GoToCart";
import "../home/Home.css";
import { useLang } from "../LanguageContext";
import { useCart } from "../CartContext";
import { getProductById } from "../services/firestore";
import { allProducts } from "../data/products";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const { cart, addToCart, removeFromCart, totalItems } = useCart();

  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try local data first (instant, no network needed)
    const local = allProducts.find(p => String(p.id) === String(id));
    if (local) {
      setRaw(local);
      setLoading(false);
      return;
    }
    // Fall back to Firestore if not found locally
    getProductById(id)
      .then(p => {
        setRaw(p || null);
        setLoading(false);
      })
      .catch(() => {
        setRaw(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#aaa" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e0d8d0", borderTop: "3px solid #3b1f0e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ fontSize: 13 }}>Loading product...</span>
    </div>
  );

  if (!raw) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🌾</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#3b1f0e" }}>Product not found</div>
      <button onClick={() => navigate("/")} style={{ padding: "10px 24px", background: "#3b1f0e", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>← Back to Home</button>
    </div>
  );

  const productInCart = cart.find(i => i.id === raw.id);
  const qty = productInCart?.qty || 0;

  const productType = raw.category === "basmati" ? "Basmati Rice"
    : raw.category === "millets" ? "Millet"
    : "Non-Basmati Rice";
  const productVariety = t[raw.varietyKey] || raw.name || raw.nameKey || "Premium Quality";

  return (
    <div className="app-container" style={{ background: "#faf8f5", minHeight: "100vh" }}>

      {/* Back button */}
      <div style={{ padding: "16px 16px 0" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#3b1f0e" }}>←</button>
      </div>

      {/* Product Image */}
      <div style={{ margin: "12px 16px", borderRadius: 16, overflow: "hidden", background: "#f0ece8", height: 240 }}>
        {(raw.imageUrl || raw.image || raw.img) ? (
          <img src={raw.imageUrl || raw.image || raw.img} alt={raw.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>🌾</div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ padding: "0 16px 160px" }}>
        <div style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{productType}</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#3b1f0e", marginBottom: 4, lineHeight: 1.2 }}>{t[raw.nameKey] || raw.name || raw.nameKey}</h1>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>{raw.weight}</div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#e65100" }}>₹{raw.price}</span>
          {raw.perKgPrice && <span style={{ fontSize: 13, color: "#aaa" }}>₹{raw.perKgPrice}/kg</span>}
        </div>

        {raw.description && (
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: "12px 0 16px", background: "#fff", padding: 14, borderRadius: 10 }}>{raw.description}</p>
        )}

        {/* Product details table */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#3b1f0e", marginBottom: 10 }}>{t.aboutDesc || "Product Details"}</div>
          {[
            [t.type || "Type", productType],
            [t.variety || "Variety", productVariety],
            [t.weight || "Weight", raw.weight],
            [t.shelfLife || "Shelf Life", t.shelfLifeValue || "12 months"],
            [t.storageInstructions || "Storage", t.storageValue || "Store in a cool, dry place"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f5f0ea", fontSize: 13 }}>
              <span style={{ color: "#888" }}>{label}</span>
              <span style={{ fontWeight: 600, color: "#333" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* WhatsApp */}
        <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, background: "#e8f5e9", borderRadius: 10, padding: "12px 16px", textDecoration: "none", marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>💬</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#2e7d32" }}>{t.whatsapp || "Chat on WhatsApp"}</div>
            <div style={{ fontSize: 11, color: "#888" }}>Quick response guaranteed</div>
          </div>
        </a>
      </div>

      {/* Floating Add to Cart */}
      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 448, zIndex: 100, display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "none" }}>
        {qty === 0 ? (
          <button onClick={() => addToCart({ ...raw, qty: 1 })} style={{ pointerEvents: "auto", width: "100%", padding: "14px", background: "#3b1f0e", color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 18px rgba(61,31,10,0.35)" }}>
            Add to Cart
          </button>
        ) : (
          <>
            {/* Row 1: qty control */}
            <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#3b1f0e", borderRadius: 14, padding: "8px 8px 8px 16px", boxShadow: "0 4px 18px rgba(61,31,10,0.35)" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>₹{raw.price * qty} · {qty} in cart</span>
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <button onClick={() => removeFromCart(raw.id)} style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, minWidth: 28, textAlign: "center" }}>{qty}</span>
                <button onClick={() => addToCart(raw)} style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: "#fff", color: "#3b1f0e", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>
            {/* Row 2: go to cart */}
            <button onClick={() => navigate("/cart")} style={{ pointerEvents: "auto", width: "100%", padding: "13px", background: "#5a8a3c", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 18px rgba(90,138,60,0.4)" }}>
              View Cart ({totalItems} {totalItems === 1 ? "item" : "items"}) →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductPage;
