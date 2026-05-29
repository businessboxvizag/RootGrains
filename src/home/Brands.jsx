import { useNavigate } from "react-router-dom";
import { useLang } from "../LanguageContext";

const brands = [
  { name: "India Gate", img: "/Brands/indiagate.png", slug: "india-gate" },
  { name: "Daawat", img: "/Brands/daawat.png", slug: "daawat" },
  { name: "Kohinoor", img: "/Brands/kohinoor.png", slug: "kohinoor" },
  { name: "Unity", img: "/Brands/unity.png", slug: "unity" },
];

function Brands() {
  const { t } = useLang();
  const navigate = useNavigate();
  return (
    <div className="brands">
      <div className="section-header">
        <h3>{t.topBrands}</h3>
        <span onClick={() => navigate("/brands")} style={{ cursor: "pointer" }}>{t.seeAll}</span>
      </div>
      <div className="brand-list">
        {brands.map((b, i) => (
          <div className="brand-item" key={i} onClick={() => navigate(`/brand/${b.slug}`)} style={{ cursor: "pointer" }}>
            <img src={b.img} alt={b.name} style={{ width: "100%", height: "60px", objectFit: "contain" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
export default Brands;