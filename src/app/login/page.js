"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { COLLEGE, isFirebaseConfigured } from "@/lib/config";
import { Spinner, IconAlert, IconCheck, IconChevronLeft } from "@/components/Icons";
import BuiltBy from "@/components/BuiltBy";

const FIREBASE_ERRORS = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-email": "That does not look like a valid email address.",
  "auth/user-not-found": "No admin account exists for this email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please wait a minute and try again.",
  "auth/network-request-failed": "Network problem — check your internet connection.",
  "auth/user-disabled": "This admin account has been disabled.",
};

export default function LoginPage() {
  const { user, loading, signIn, resetPassword } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/feed");
  }, [user, loading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setNotice("");

    if (!email.trim() || !password) {
      setError("Please enter both your email and password.");
      return;
    }

    setBusy(true);
    try {
      // The redirect is left to the effect above: it fires once React has
      // committed the signed-in user, so the protected layout does not see a
      // null user and bounce straight back here.
      await signIn(email, password);
    } catch (err) {
      setError(FIREBASE_ERRORS[err?.code] || err?.message || "Could not sign you in.");
      setBusy(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Enter your admin email above, then tap “Forgot password?”.");
      return;
    }
    setResetting(true);
    try {
      await resetPassword(email);
      setNotice(`A reset link has been sent to ${email.trim()}. Check your inbox and spam folder.`);
    } catch (err) {
      setError(FIREBASE_ERRORS[err?.code] || err?.message || "Could not send the reset email.");
    }
    setResetting(false);
  }

  return (
    <main className="flex min-h-dvh flex-col lg:flex-row">
      {/* ── Brand panel ─────────────────────────────────────────── */}
      <section className="relative flex shrink-0 flex-col justify-between overflow-hidden bg-linear-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-8 text-white lg:w-[46%] lg:px-14 lg:py-14">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-black/15 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3.5">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white p-1.5 shadow-md lg:h-16 lg:w-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={COLLEGE.logo} alt="College logo" className="h-full w-full object-contain" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
              {COLLEGE.trust}
            </p>
            <h1 className="text-lg font-bold leading-tight lg:text-xl">{COLLEGE.name}</h1>
            <p className="text-sm text-white/75">{COLLEGE.city}</p>
          </div>
        </div>

        <div className="relative mt-10 max-w-md lg:mt-0">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight lg:text-[2.7rem]">
            Press &amp; Media
            <br />
            Archive.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/85 lg:text-base">
            The college has been written about in the district papers for decades. This
            is where that record is kept — a permanent, searchable archive of the
            institution as the press has seen it, year after year.
          </p>
        </div>

        <div className="relative mt-8 hidden text-xs lg:block">
          <p className="text-white/60">
            Administrator access only · {new Date().getFullYear()}
          </p>
          <BuiltBy tone="dark" className="mt-1.5 justify-start text-[13px]" />
        </div>
      </section>

      {/* ── Sign-in panel ───────────────────────────────────────── */}
      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
          >
            <IconChevronLeft className="h-4 w-4" />
            Back to the archive
          </Link>

          <h2 className="text-2xl font-bold tracking-tight text-ink-900">Admin sign in</h2>
          <p className="mt-1.5 text-sm text-ink-500">
            This archive is managed by college administrators.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-ink-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="principal@csmudgir.edu.in"
                className="w-full rounded-xl border border-black/12 bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-500/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <label htmlFor="password" className="text-sm font-medium text-ink-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetting}
                  className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 hover:underline disabled:opacity-60"
                >
                  {resetting ? "Sending…" : "Forgot password?"}
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-black/12 bg-white py-3 pl-4 pr-16 text-[15px] outline-none transition placeholder:text-ink-500/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-500 transition hover:bg-black/5 hover:text-ink-900"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {notice && (
              <p
                role="status"
                className="flex items-start gap-2 rounded-xl bg-green-50 px-3.5 py-3 text-sm text-green-800"
              >
                <IconCheck className="mt-px h-4.5 w-4.5 shrink-0" />
                <span>{notice}</span>
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-brand-50 px-3.5 py-3 text-sm text-brand-700"
              >
                <IconAlert className="mt-px h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !isFirebaseConfigured}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/25 disabled:opacity-60"
            >
              {busy && <Spinner className="h-4.5 w-4.5" />}
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {!isFirebaseConfigured && (
            <p className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 p-4 text-sm leading-relaxed text-ink-700">
              Firebase keys are missing, so sign-in is disabled. Add them to{" "}
              <code className="font-mono text-[13px]">.env.local</code> and restart
              the server.
            </p>
          )}

          <div className="mt-8 text-center text-xs lg:hidden">
            <p className="text-ink-500">
              {COLLEGE.name}, {COLLEGE.city}
            </p>
            <BuiltBy className="mt-1.5 text-[13px]" />
          </div>
        </div>
      </section>
    </main>
  );
}
