import { useNavigate } from "react-router-dom";
import { useLang } from "../LanguageContext";

function GoToCart({ itemCount }) {
  const navigate = useNavigate();
  const { t } = useLang();
  if (itemCount === 0) return null;
  return (
    <div className="go-to-cart-bar" onClick={() => navigate("/cart")}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ background: "rgba(255,255,255,0.18)", borderRadius: "var(--radius-sm)", padding: "3px 10px", fontWeight: "700", fontSize: "13px" }}>
          {itemCount} {itemCount > 1 ? t.items : t.item}
        </span>
        <span style={{ fontSize: "13px", fontWeight: "600" }}>{t.added}</span>
      </div>
      <span style={{ fontSize: "13px", fontWeight: "700" }}>{t.goToCart}</span>
    </div>
  );
}
export default GoToCart;
