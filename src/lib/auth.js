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
import { subscribeProfile, readProfile } from "./store";

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

  /* ── only accounts with an admins/{uid} doc may stay signed in ── */
  // Admin docs are created by hand in the Firebase console. Anyone else who
  // manages to hold a Firebase session (e.g. an account minted through the
  // public Auth API) is signed straight back out.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      let isAdmin = false;
      try {
        isAdmin = Boolean(await readProfile(user.uid));
      } catch {
        // permission denied - not an admin
      }
      if (!cancelled && !isAdmin) await fbSignOut(getFirebaseAuth());
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const signIn = useCallback(async (email, password) => {
    const auth = getFirebaseAuth();
    await setPersistence(auth, browserLocalPersistence);
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    let isAdmin = false;
    try {
      isAdmin = Boolean(await readProfile(cred.user.uid));
    } catch {
      // permission denied - not an admin
    }
    if (!isAdmin) {
      await fbSignOut(auth);
      throw new Error("This account is not an administrator.");
    }
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
