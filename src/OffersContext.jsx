import { createContext, useContext, useState, useEffect } from "react";
import { subscribeBanners } from "./services/firestore";

const OffersContext = createContext({ activeOffers: [], getDiscount: () => null, applyDiscount: (p) => p });

export function OffersProvider({ children }) {
  const [activeOffers, setActiveOffers] = useState([]);

  useEffect(() => {
    const unsub = subscribeBanners(all => {
      setActiveOffers(
        all.filter(b =>
          b.active &&
          (b.type === "Offer" || b.type === "Promotion") &&
          b.discountPercent > 0
        )
      );
    });
    return unsub;
  }, []);

  // Returns the best applicable discount for a product, or null
  // Matches: "all", category slug (e.g. "basmati"), or brand slug (e.g. "india-gate")
  const getDiscount = (product) => {
    if (!product || activeOffers.length === 0) return null;
    const applicable = activeOffers.filter(o =>
      o.applyTo === "all" ||
      o.applyTo === product.category ||
      (product.brand && o.applyTo === product.brand)
    );
    if (applicable.length === 0) return null;
    // Pick the highest discount
    const best = [...applicable].sort((a, b) => b.discountPercent - a.discountPercent)[0];
    return {
      percent: best.discountPercent,
      label: best.discountText || `${best.discountPercent}% OFF`,
      title: best.title,
    };
  };

  // Returns the discounted price (rounded to nearest rupee)
  const applyDiscount = (price, product) => {
    const d = getDiscount(product);
    if (!d) return price;
    return Math.round(price * (1 - d.percent / 100));
  };

  // Returns cart items with discounted prices + new subtotal
  const discountedCart = (cart) => {
    const items = cart.map(item => {
      const discounted = applyDiscount(item.price, item);
      return { ...item, originalPrice: item.price, price: discounted };
    });
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    return { items, subtotal };
  };

  return (
    <OffersContext.Provider value={{ activeOffers, getDiscount, applyDiscount, discountedCart }}>
      {children}
    </OffersContext.Provider>
  );
}

export function useOffers() { return useContext(OffersContext); }
