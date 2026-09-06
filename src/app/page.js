"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { COLLEGE } from "@/lib/config";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/feed" : "/login");
  }, [user, loading, router]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={COLLEGE.logo}
        alt=""
        className="h-16 w-16 animate-pulse rounded-xl object-contain"
      />
      <p className="text-sm text-ink-500">Loading News Desk…</p>
    </main>
  );
}
