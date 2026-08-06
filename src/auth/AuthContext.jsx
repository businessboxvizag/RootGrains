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
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import { saveCustomer, getCustomer, getCustomerByPhone, getCustomerByEmail } from "../services/firestore";

const AuthContext = createContext(null);
const EMAIL_LINK_KEY = "rg_email_for_signin";

function appBaseUrl() {
  return window.location.origin;
}

// Stable RecaptchaVerifier bound to the persistent #rg-recaptcha div in App.jsx
function getRecaptchaVerifier() {
  if (window._rgRecaptcha) return window._rgRecaptcha;
  window._rgRecaptcha = new RecaptchaVerifier(auth, "rg-recaptcha", {
    size: "invisible",
    callback: () => {},
    "expired-callback": () => {
      window._rgRecaptcha = null;
    },
  });
  return window._rgRecaptcha;
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
            // Strip the Firebase sign-in params from the URL for a clean address.
            try { window.history.replaceState({}, document.title, appBaseUrl() + "/#/"); } catch { /* ignore */ }
            if (result.user) {
              // Check if this account already exists (by UID or email)
              const byUid = await getCustomer(result.user.uid);
              if (!byUid) {
                const byEmail = await getCustomerByEmail(savedEmail);
                await saveCustomer(result.user.uid, byEmail
                  ? { ...byEmail }  // merge existing profile into new UID
                  : { email: savedEmail, name: result.user.displayName || "", phone: "", createdAt: new Date() }
                );
              }
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

  // ── Phone OTP ─────────────────────────────────────────────────────────────
  const sendPhoneOTP = async (phoneNumber) => {
    // Reset verifier if it errored previously
    if (window._rgRecaptcha) {
      try { window._rgRecaptcha.clear(); } catch {}
      window._rgRecaptcha = null;
    }
    const verifier = getRecaptchaVerifier();
    return await signInWithPhoneNumber(auth, "+91" + phoneNumber, verifier);
  };

  const verifyPhoneOTP = async (confirmationResult, code) => {
    const result = await confirmationResult.confirm(code);
    const phoneUser = result.user;
    const phone = phoneUser.phoneNumber; // "+91XXXXXXXXXX"

    // Check if this UID already has a complete profile
    const byUid = await getCustomer(phoneUser.uid);
    if (byUid && byUid.name) {
      // Existing user — just refresh the record
      await saveCustomer(phoneUser.uid, { phone, updatedAt: new Date() });
      return { user: phoneUser, isNew: false };
    }

    // Check if this phone belongs to an existing account (registered via email)
    const byPhone = await getCustomerByPhone(phone);
    if (byPhone) {
      // Merge the existing profile into this phone-auth UID
      await saveCustomer(phoneUser.uid, { ...byPhone, updatedAt: new Date() });
      return { user: phoneUser, isNew: false };
    }

    // Brand new user
    await saveCustomer(phoneUser.uid, {
      phone,
      name: "",
      email: "",
      createdAt: new Date(),
    });
    return { user: phoneUser, isNew: true };
  };

  // ── Email magic link ───────────────────────────────────────────────────────
  const sendEmailLink = async (email) => {
    const actionCodeSettings = {
      // Must be a plain (non-hash) URL — Firebase appends its params as a query
      // string, and a hash route (/#/login) would hide them from the SDK.
      url: appBaseUrl() + "/",
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem(EMAIL_LINK_KEY, email);
  };

  // ── Password reset ─────────────────────────────────────────────────────────
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email, {
      url: appBaseUrl() + "/#/login",
      handleCodeInApp: false,
    });
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
      sendEmailLink, resetPassword,
      signup, login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
