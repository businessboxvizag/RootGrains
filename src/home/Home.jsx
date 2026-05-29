import "./Home.css";
import Header from "./Header";
import Hero from "./Hero";
import Brands from "./Brands";
import Categories from "./Categories";
import Products from "./Products";
import BottomNav from "./BottomNav";
import { useLang } from "../LanguageContext";

function Home() {
  const { t } = useLang();
  return (
    <div className="mobile">
      <Header />
      <Hero />
      <div className="notice-bar">
        <div className="notice-scroll">
          {t.notice}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          {t.notice}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </div>
      </div>
      <Brands />
      <Categories />
      <Products />
      <BottomNav />
    </div>
  );
}
export default Home;