import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./auth/AuthContext";
import { getFirestoreCart, saveFirestoreCart } from "./services/firestore";

export const CartContext = createContext();

const GUEST_CART_KEY = "rg_guest_cart";
const GUEST_CART_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function loadGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const { items, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > GUEST_CART_EXPIRY_MS) {
      localStorage.removeItem(GUEST_CART_KEY);
      return [];
    }
    return items || [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify({ items, savedAt: Date.now() }));
  } catch {}
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(() => loadGuestCart()); // instant load from localStorage
  const [cartLoaded, setCartLoaded] = useState(false);
  const saveTimerRef = useRef(null);
  const prevUserRef = useRef(null);

  // When auth resolves, load the right cart
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // User just logged in — load from Firestore
      getFirestoreCart(user.uid).then(items => {
        if (items.length > 0) {
          setCart(items);
        }
        // If Firestore cart is empty but local guest cart has items, keep local
        setCartLoaded(true);
      }).catch(() => setCartLoaded(true));
    } else {
      // Guest — cart is already loaded from localStorage via useState initializer
      setCartLoaded(true);
    }
    prevUserRef.current = user;
  }, [user, authLoading]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!authLoading && prevUserRef.current && !user) {
      setCart([]);
      localStorage.removeItem(GUEST_CART_KEY);
    }
    prevUserRef.current = user;
  }, [user, authLoading]);

  // Persist cart whenever it changes (debounced for Firestore)
  useEffect(() => {
    if (!cartLoaded) return;

    if (user) {
      // Debounce Firestore writes — wait 800ms after last change
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveFirestoreCart(user.uid, cart).catch(console.error);
      }, 800);
    } else {
      // Guest — save to localStorage immediately
      saveGuestCart(cart);
    }

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [cart, user, cartLoaded]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.qty > 1) return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
      return prev.filter(i => i.id !== id);
    });
  };

  const deleteFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const clearCart = () => {
    setCart([]);
    if (user) saveFirestoreCart(user.uid, []).catch(console.error);
    else localStorage.removeItem(GUEST_CART_KEY);
  };

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, deleteFromCart, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }
