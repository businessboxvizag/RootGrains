import { createContext, useContext, useState, useEffect } from "react";
import { signInWithCustomToken, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Sign up with phone + 4-digit MPIN ───────────────────────────────────────
  // The backend creates the account and returns a Firebase custom token; we then
  // sign in with it. No SMS, no reCAPTCHA, no OAuth.
  const signupWithMpin = async (data) => {
    const r = await fetch("/api/auth-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "Sign-up failed. Please try again.");
    await signInWithCustomToken(auth, j.token);
    return true;
  };

  // ── Log in with phone + MPIN ────────────────────────────────────────────────
  const loginWithMpin = async (phone, mpin) => {
    const r = await fetch("/api/auth-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, mpin }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "Login failed. Please try again.");
    await signInWithCustomToken(auth, j.token);
    return true;
  };

  const logout = async () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, signupWithMpin, loginWithMpin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
