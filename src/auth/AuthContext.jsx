import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "../firebase";
import { saveCustomer } from "../services/firestore";

const AuthContext = createContext(null);

const EMAIL_LINK_KEY = "rg_email_for_signin";

function appBaseUrl() {
  return window.location.origin;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Complete email-link sign-in if returning from the magic link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const savedEmail = localStorage.getItem(EMAIL_LINK_KEY);
      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(async (result) => {
            localStorage.removeItem(EMAIL_LINK_KEY);
            if (result.user) {
              await saveCustomer(result.user.uid, {
                email: savedEmail,
                name: result.user.displayName || "",
                phone: "",
                createdAt: new Date(),
              });
            }
          })
          .catch(() => {});
      }
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Phone OTP (SMS) ────────────────────────────────────────────────────────
  const sendPhoneOTP = async (phoneNumber, recaptchaContainerId) => {
    if (window._rgRecaptcha) {
      try { window._rgRecaptcha.clear(); } catch {}
      window._rgRecaptcha = null;
    }
    const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: "invisible",
      callback: () => {},
    });
    window._rgRecaptcha = verifier;
    return await signInWithPhoneNumber(auth, "+91" + phoneNumber, verifier);
  };

  const verifyPhoneOTP = async (confirmationResult, code) => {
    const result = await confirmationResult.confirm(code);
    if (result.user) {
      await saveCustomer(result.user.uid, {
        phone: result.user.phoneNumber || "",
        name: result.user.displayName || "",
        email: result.user.email || "",
        createdAt: new Date(),
      });
    }
    return result.user;
  };

  // ── Email magic link (passwordless) ───────────────────────────────────────
  const sendEmailLink = async (email) => {
    const actionCodeSettings = {
      url: appBaseUrl() + "/#/login",
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem(EMAIL_LINK_KEY, email);
  };

  // ── Legacy email+password (kept for existing users) ───────────────────────
  const signup = async (name, email, password, phone) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await saveCustomer(cred.user.uid, { name, email, phone: phone || "", createdAt: new Date() });
    return cred.user;
  };

  const login = async (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = async () => signOut(auth);

  return (
    <AuthContext.Provider value={{
      user, loading,
      sendPhoneOTP, verifyPhoneOTP,
      sendEmailLink,
      signup, login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
