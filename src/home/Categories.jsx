import { useNavigate } from "react-router-dom";
import { useLang } from "../LanguageContext";

function Categories() {
  const { t } = useLang();
  const navigate = useNavigate();
  const cats = [
    { name: t.basmati, img: "/categories/basmati.png", slug: "basmati" },
    { name: t.nonBasmati, img: "/categories/nonbasmati.png", slug: "non-basmati" },
    { name: t.millets, img: "/categories/millets.png", slug: "millets" },
  ];
  return (
    <div className="categories">
      <h3>{t.shopByCategory}</h3>
      <div className="category-list">
        {cats.map((c, i) => (
          <div className="category-item" key={i} onClick={() => navigate(`/category/${c.slug}`)} style={{ cursor: "pointer" }}>
            <div className="category-circle"><img src={c.img} alt={c.name} /></div>
            <p>{c.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Categories;