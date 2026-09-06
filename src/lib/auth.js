"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

import { getFirebaseAuth } from "./firebase";
import { isFirebaseConfigured } from "./config";
import { subscribeProfile, saveProfile, readProfile } from "./store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── who is signed in ─────────────────────────────────────────── */
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
      setUser(fbUser ? { uid: fbUser.uid, email: fbUser.email } : null);
      setLoading(false);
    });
  }, []);

  /* ── that admin's profile card ────────────────────────────────── */
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    return subscribeProfile(user.uid, setProfile);
  }, [user]);

  /* ── first sign-in creates a starter profile ──────────────────── */
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const existing = await readProfile(user.uid);
        if (cancelled || existing) return;
        await saveProfile(user.uid, {
          name: user.email?.split("@")[0] || "Administrator",
          role: "Administrator",
          email: user.email || "",
          photoUrl: "",
          photoPublicId: "",
        });
      } catch {
        // A missing profile is not fatal - the admin can fill it in later.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const signIn = useCallback(async (email, password) => {
    const auth = getFirebaseAuth();
    await setPersistence(auth, browserLocalPersistence);
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return { uid: cred.user.uid, email: cred.user.email };
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(getFirebaseAuth());
  }, []);

  /** Emails a reset link. Firebase hosts the reset page itself. */
  const resetPassword = useCallback(async (email) => {
    const trimmed = (email || "").trim();
    if (!trimmed) throw new Error("Enter your email address first.");
    await sendPasswordResetEmail(getFirebaseAuth(), trimmed);
  }, []);

  /** Token sent to our own API routes so they can verify the caller. */
  const getIdToken = useCallback(async () => {
    const auth = getFirebaseAuth();
    return auth?.currentUser ? auth.currentUser.getIdToken() : null;
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, signIn, signOut, resetPassword, getIdToken }),
    [user, profile, loading, signIn, signOut, resetPassword, getIdToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
