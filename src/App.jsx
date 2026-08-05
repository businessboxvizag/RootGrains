import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./home/Home";
import SearchPage from "./search/SearchPage";
import ProductPage from "./product/ProductPage";
import CartPage from "./cart/CartPage";
import CheckoutPage from "./checkout/CheckoutPage";
import OrderTrackingPage from "./order/OrderTrackingPage";
import LoginPage from "./auth/LoginPage";
import ProfilePage from "./profile/ProfilePage";
import SavedAddressesPage from "./profile/SavedAddressesPage";
import NotificationsPage from "./profile/NotificationsPage";
import AdminDashboard from "./admin/AdminDashboard";
import BBSuperAdmin from "./bb-admin/BBSuperAdmin";
import CategoryPage from "./category/CategoryPage";
import BrandPage from "./brand/BrandPage";
import BrandsPage from "./brand/BrandsPage";
import { AdminAuthProvider } from "./admin/AdminAuthContext";
import { ProductsProvider } from "./ProductsContext";
import { AuthProvider } from "./auth/AuthContext";
import { CartProvider } from "./CartContext";
import { OffersProvider } from "./OffersContext";
import SignupPage from "./auth/SignupPage";
import { useLang } from "./LanguageContext";

function AppRoutes() {
  const { lang } = useLang();
  return (
    <div className={lang === "TE" ? "lang-te" : ""}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/saved-addresses" element={<SavedAddressesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/brand/:slug" element={<BrandPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/bb-admin" element={<BBSuperAdmin />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AdminAuthProvider>
        <AuthProvider>
          <CartProvider>
            <OffersProvider>
              <ProductsProvider>
                <AppRoutes />
              </ProductsProvider>
            </OffersProvider>
          </CartProvider>
        </AuthProvider>
      </AdminAuthProvider>
      {/* Persistent invisible reCAPTCHA anchor — must stay in DOM at all times */}
      <div id="rg-recaptcha" style={{ position: "fixed", bottom: 0, left: 0, zIndex: -1 }} />
    </HashRouter>
  );
}

export default App;
