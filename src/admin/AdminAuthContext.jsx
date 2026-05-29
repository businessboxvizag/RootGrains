import { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";

const AdminAuthContext = createContext(null);

const BB_SUPER_ADMIN_EMAIL = "businessboxvizag@gmail.com";

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email, password) => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(e.message || "Invalid email or password. Please try again.");
      throw e;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isBBAdmin = user?.email === BB_SUPER_ADMIN_EMAIL;
  const isKBRAdmin = !!user;

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isBBAdmin,
        isKBRAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);