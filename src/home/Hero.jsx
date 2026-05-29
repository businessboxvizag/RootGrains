import { useNavigate } from "react-router-dom";
import { useLang } from "../LanguageContext";

function Hero() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [titleLine1, titleLine2] = t.heroTitle.split("\n");
  const paraLines = t.heroPara.split("\n");
  return (
    <div className="hero">
      <div className="hero-text">
        <h2>{titleLine1}<br />{titleLine2}</h2>
        <p>{paraLines[0]}<br />{paraLines[1]}<br />{paraLines[2]}</p>
        <div className="hero-buttons">
          <button className="primary" onClick={() => navigate("/search")}>{t.shopNow}</button>
        </div>
      </div>
    </div>
  );
}
export default Hero;