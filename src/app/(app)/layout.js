"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AppDataProvider } from "@/lib/app-context";
import AppShell from "@/components/AppShell";
import UploadModal from "@/components/UploadModal";
import BoardModal from "@/components/BoardModal";
import { COLLEGE, isFirebaseConfigured, missingKeys } from "@/lib/config";

export default function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (!isFirebaseConfigured) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={COLLEGE.logo} alt="" className="h-14 w-14 object-contain" />
        <h1 className="text-xl font-bold tracking-tight text-ink-900">
          Setup not finished
        </h1>
        <p className="text-sm leading-relaxed text-ink-500">
          These keys are still missing from{" "}
          <code className="font-mono text-[13px]">.env.local</code>. Add them and
          restart the server.
        </p>
        <ul className="w-full space-y-1 rounded-2xl bg-black/[0.04] p-4 text-left font-mono text-[12.5px] text-ink-700">
          {missingKeys().map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={COLLEGE.logo}
          alt=""
          className="h-14 w-14 animate-pulse rounded-xl object-contain"
        />
        <p className="text-sm text-ink-500">Checking your session…</p>
      </div>
    );
  }

  return (
    <AppDataProvider>
      <AppShell>{children}</AppShell>
      <UploadModal />
      <BoardModal />
    </AppDataProvider>
  );
}
