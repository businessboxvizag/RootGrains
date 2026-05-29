import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "../LanguageContext";
import { useCart } from "../CartContext";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const { totalItems } = useCart();
  return (
    <nav className="bottom-nav">
      <div className="nav-items-left">
        <div className={`nav-item ${location.pathname === "/" ? "active" : ""}`} onClick={() => navigate("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>{t.home}</span>
        </div>
        <div className={`nav-item ${location.pathname === "/cart" ? "active" : ""}`} onClick={() => navigate("/cart")} style={{ position: "relative" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {totalItems > 0 && (
            <span style={{ position: "absolute", top: "-4px", right: "-6px", background: "var(--gold)", color: "#fff", width: "16px", height: "16px", borderRadius: "50%", fontSize: "9px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>{totalItems}</span>
          )}
          <span>{t.cart}</span>
        </div>
        <div className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`} onClick={() => navigate("/profile")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="7" r="4"/><path d="M5.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/>
          </svg>
          <span>{t.profile}</span>
        </div>
      </div>

      <div className="nav-search-box" onClick={() => navigate("/search")}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder={t.searchNav} readOnly style={{ cursor: "pointer" }} />
      </div>
    </nav>
  );
}
export default BottomNav;
