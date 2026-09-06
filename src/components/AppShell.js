"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { Dropdown, MenuItem, Button } from "./ui";
import {
  IconSearch,
  IconHome,
  IconGrid,
  IconUser,
  IconLogout,
  IconPlus,
  IconImage,
  IconFolder,
  IconChevronDown,
  IconClose,
} from "./Icons";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/app-context";
import { COLLEGE } from "@/lib/config";

const NAV = [
  { href: "/feed", label: "Feed", icon: IconHome },
  { href: "/collections", label: "Collections", icon: IconGrid },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { query, setQuery, openUpload, openCreateBoard } = useApp();

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  function onSearch(value) {
    setQuery(value);
    if (value && pathname !== "/feed") router.push("/feed");
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  const CreateMenu = ({ className = "" }) => (
    <Dropdown
      className={className}
      button={({ toggle, open }) => (
        <Button variant="dark" onClick={toggle} className="shrink-0">
          <IconPlus className="h-4.5 w-4.5" />
          <span className="hidden sm:inline">Create</span>
          <IconChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </Button>
      )}
    >
      <MenuItem icon={<IconImage className="h-4.5 w-4.5" />} onClick={() => openUpload()}>
        Pin
      </MenuItem>
      <MenuItem icon={<IconFolder className="h-4.5 w-4.5" />} onClick={openCreateBoard}>
        Board
      </MenuItem>
    </Dropdown>
  );

  return (
    <div className="min-h-dvh bg-white">
      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-black/6 bg-white/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-2 px-3 sm:gap-3 sm:px-5">
          <Link href="/feed" className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white p-0.5 ring-1 ring-black/8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={COLLEGE.logo} alt="" className="h-full w-full object-contain" />
            </span>
            <span className="hidden min-w-0 leading-tight lg:block">
              <span className="block truncate text-[13px] font-bold text-ink-900">
                {COLLEGE.name}
              </span>
              <span className="block text-[11px] text-ink-500">
                {COLLEGE.city} · News Desk
              </span>
            </span>
          </Link>

          {/* desktop nav */}
          <nav className="hidden shrink-0 items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[15px] font-semibold transition ${
                  isActive(item.href)
                    ? "bg-ink-900 text-white"
                    : "text-ink-700 hover:bg-black/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* search */}
          <div className="relative min-w-0 flex-1">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-500" />
            <input
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search cuttings…"
              aria-label="Search cuttings"
              className="w-full rounded-full border border-transparent bg-black/6 py-2.5 pl-10 pr-9 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/12"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-500 transition hover:bg-black/8 hover:text-ink-900"
              >
                <IconClose className="h-4 w-4" />
              </button>
            )}
          </div>

          <CreateMenu className="hidden sm:block" />

          {/* profile menu */}
          <Dropdown
            button={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-label="Account menu"
                className="shrink-0 rounded-full ring-offset-2 transition hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <Avatar profile={profile} email={user?.email} size={38} />
              </button>
            )}
          >
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar profile={profile} email={user?.email} size={42} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">
                  {profile?.name || "Administrator"}
                </p>
                <p className="truncate text-xs text-ink-500">
                  {profile?.role || "Admin"}
                </p>
              </div>
            </div>
            <div className="my-1 border-t border-black/6" />
            <MenuItem
              as={Link}
              href="/profile"
              icon={<IconUser className="h-4.5 w-4.5" />}
            >
              Profile &amp; settings
            </MenuItem>
            <MenuItem
              as={Link}
              href="/collections"
              icon={<IconGrid className="h-4.5 w-4.5" />}
            >
              My collections
            </MenuItem>
            <div className="my-1 border-t border-black/6" />
            <MenuItem
              icon={<IconLogout className="h-4.5 w-4.5" />}
              tone="danger"
              onClick={handleSignOut}
            >
              Sign out
            </MenuItem>
          </Dropdown>
        </div>

      </header>

      <main className="mx-auto max-w-[1800px] px-3 pb-28 pt-4 sm:px-5 md:pb-10">
        {children}
      </main>

      {/* ── Mobile bottom bar ────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/8 bg-white/95 backdrop-blur-md pb-safe md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 pt-1.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10.5px] font-semibold transition ${
                  active ? "text-brand-600" : "text-ink-500"
                }`}
              >
                <Icon className="h-6 w-6" />
                {item.label}
              </Link>
            );
          })}

          <Dropdown
            align="right"
            className="flex-1"
            button={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-label="Create"
                className="mx-auto -mt-5 grid h-13 w-13 place-items-center rounded-full bg-brand-600 text-white shadow-lg ring-4 ring-white transition active:scale-95"
                style={{ height: "3.25rem", width: "3.25rem" }}
              >
                <IconPlus className="h-6 w-6" />
              </button>
            )}
          >
            <MenuItem
              icon={<IconImage className="h-4.5 w-4.5" />}
              onClick={() => openUpload()}
            >
              Pin
            </MenuItem>
            <MenuItem icon={<IconFolder className="h-4.5 w-4.5" />} onClick={openCreateBoard}>
              Board
            </MenuItem>
          </Dropdown>

          <Link
            href="/profile"
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10.5px] font-semibold transition ${
              isActive("/profile") ? "text-brand-600" : "text-ink-500"
            }`}
          >
            <IconUser className="h-6 w-6" />
            Profile
          </Link>
        </div>
      </nav>
    </div>
  );
}
