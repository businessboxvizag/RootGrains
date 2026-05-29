import { useNavigate } from "react-router-dom";
import { useLang } from "../LanguageContext";

function Header() {
  const { lang, toggleLang } = useLang();
  const navigate = useNavigate();
  return (
    <div className="header">
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img src="/logo.png" alt="Root Grains logo" />
        <div className="logo-name">
          Root Grains
          <span>Pure · Natural · Local</span>
        </div>
      </div>
      <div className="header-right">
        <div className="lang-toggle" onClick={toggleLang}>
          <span className={lang === "EN" ? "lang-active" : "lang-inactive"}>EN</span>
          <span className="lang-divider">|</span>
          <span className={lang === "TE" ? "lang-active" : "lang-inactive"}>తె</span>
        </div>
      </div>
    </div>
  );
}
export default Header;
