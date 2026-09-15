"use client";

import PublicHeader from "@/components/PublicHeader";
import PublicNav from "@/components/PublicNav";
import { AppDataProvider } from "@/lib/app-context";

/**
 * The public archive: the main feed, the collections index and each
 * collection's own page. No sign-in required for any of them - reading is
 * open to everyone, and every write stays behind /login.
 *
 * It shares AppDataProvider with the admin side so both are reading the
 * same two live lists (cuttings + collections) in the same shape.
 */
export default function PublicLayout({ children }) {
  return (
    <AppDataProvider>
      <div className="min-h-dvh bg-white">
        <PublicHeader />
        <PublicNav />
        <main className="mx-auto max-w-[1800px] px-3 pb-16 pt-4 sm:px-5">
          {children}
        </main>
      </div>
    </AppDataProvider>
  );
}
