import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../LanguageContext";
import { useCart } from "../CartContext";
import { allProducts } from "../data/products";

// Group products by nameKey + subCategory → one card per group
function groupVariants(products) {
  const map = new Map();
  products.forEach(p => {
    const key = p.nameKey + (p.subCategory || "");
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  });
  return Array.from(map.values());
}

function ProductCard({ variants, t }) {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart } = useCart();
  const [selectedId, setSelectedId] = useState(variants[0].id);

  const selected = variants.find(v => v.id === selectedId) || variants[0];
  const cartItem = cart.find(i => i.id === selected.id);
  const qty = cartItem ? cartItem.qty : 0;
  const productName = t[selected.nameKey] || selected.nameKey;

  return (
    <div className="product-card" onClick={() => navigate(`/product/${selected.id}`)}>
      {/* Add / Qty control */}
      <div className="card-top">
        {qty === 0 ? (
          <button
            className="add-btn"
            onClick={e => { e.stopPropagation(); addToCart({ ...selected, name: productName, perKg: `₹${selected.perKgPrice}/kg` }); }}
          >+</button>
        ) : (
          <div
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--brown-dark)", borderRadius: "6px", padding: "2px 8px" }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={e => { e.stopPropagation(); removeFromCart(selected.id); }} style={{ background: "none", border: "none", color: "#fff", fontSize: "16px", cursor: "pointer" }}>−</button>
            <span style={{ color: "#fff", fontWeight: "700", fontSize: "12px" }}>{qty}</span>
            <button onClick={e => { e.stopPropagation(); addToCart({ ...selected, name: productName, perKg: `₹${selected.perKgPrice}/kg` }); }} style={{ background: "none", border: "none", color: "#fff", fontSize: "16px", cursor: "pointer" }}>+</button>
          </div>
        )}
      </div>

      {/* Image */}
      <div className="product-img"><img src={selected.img} alt={productName} /></div>

      {/* Weight dropdown */}
      <div onClick={e => e.stopPropagation()} style={{ margin: "6px 6px 2px", position: "relative" }}>
        <select
          value={selectedId}
          onChange={e => { e.stopPropagation(); setSelectedId(e.target.value); }}
          style={{
            width: "100%", padding: "5px 20px 5px 8px",
            border: "1.5px solid var(--border)", borderRadius: "20px",
            fontSize: "11px", fontWeight: "600", color: "var(--brown-dark)",
            background: "#fff", cursor: "pointer",
            appearance: "none", WebkitAppearance: "none",
            fontFamily: "var(--font-body)",
          }}
        >
          {variants.map(v => (
            <option key={v.id} value={v.id}>
              {v.weight}  (₹{v.perKgPrice}/kg)
            </option>
          ))}
        </select>
        <span style={{ position: "absolute", right: "7px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "9px", color: "var(--brown-dark)" }}>▾</span>
      </div>

      <h4>{productName}</h4>
      <p className="price">₹{selected.price}</p>
      <p className="per-kg">₹{selected.perKgPrice}/kg</p>
    </div>
  );
}

function Products() {
  const { t } = useLang();
  const navigate = useNavigate();

  const nonBasmatiGroups = groupVariants(allProducts.filter(p => p.category === "non-basmati")).slice(0, 4);
  const milletGroups = groupVariants(allProducts.filter(p => p.category === "millets")).slice(0, 4);

  return (
    <div>
      <div className="products">
        <div className="section-header">
          <h3>{t.nonBasmatiSection}</h3>
          <span onClick={() => navigate("/category/non-basmati")}>{t.seeAllProducts}</span>
        </div>
        <div className="product-list">
          {nonBasmatiGroups.map(variants => (
            <ProductCard key={variants[0].nameKey + (variants[0].subCategory || "")} variants={variants} t={t} />
          ))}
        </div>
        <button className="see-all-btn" onClick={() => navigate("/category/non-basmati")}>{t.seeAllProducts}</button>
      </div>

      <div className="products">
        <div className="section-header">
          <h3>{t.milletsSection}</h3>
          <span onClick={() => navigate("/category/millets")}>{t.seeAllProducts}</span>
        </div>
        <div className="product-list">
          {milletGroups.map(variants => (
            <ProductCard key={variants[0].nameKey + (variants[0].subCategory || "")} variants={variants} t={t} />
          ))}
        </div>
        <button className="see-all-btn" onClick={() => navigate("/category/millets")}>{t.seeAllProducts}</button>
      </div>
    </div>
  );
}

export default Products;
export { ProductCard };
