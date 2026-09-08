"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import { Button, ConfirmDialog } from "@/components/ui";
import {
  IconCamera,
  IconTrash,
  IconLogout,
  IconImage,
  IconFolder,
  Spinner,
} from "@/components/Icons";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/app-context";
import { saveProfile } from "@/lib/store";
import { uploadImage, validateImageFile } from "@/lib/upload";
import { COLLEGE } from "@/lib/config";

export default function ProfilePage() {
  const { user, profile, signOut, getIdToken } = useAuth();
  const { posts, boards } = useApp();
  const { toast, error: toastError } = useToast();
  const router = useRouter();

  const [photoBusy, setPhotoBusy] = useState(false);
  const [confirmPhoto, setConfirmPhoto] = useState(false);
  const fileRef = useRef(null);

  async function handlePhoto(file) {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      toastError(problem);
      return;
    }
    setPhotoBusy(true);
    try {
      const uploaded = await uploadImage(file, { folder: "csm-news/avatars" });
      await saveProfile(user.uid, {
        photoUrl: uploaded.imageUrl,
        photoPublicId: uploaded.publicId || "",
      });
      toast("Profile photo updated.");
    } catch (err) {
      toastError(err.message || "Could not upload that photo.");
    }
    setPhotoBusy(false);
  }

  async function removePhoto() {
    setPhotoBusy(true);
    try {
      if (profile?.photoPublicId) {
        const idToken = await getIdToken();
        fetch("/api/cloudinary/destroy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: profile.photoPublicId, idToken }),
        }).catch(() => {});
      }
      await saveProfile(user.uid, { photoUrl: "", photoPublicId: "" });
      toast("Profile photo removed.");
    } catch (err) {
      toastError(err.message || "Could not remove the photo.");
    }
    setConfirmPhoto(false);
    setPhotoBusy(false);
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  return (
    <div className="mx-auto max-w-2xl pb-8">
      {/* ── identity card ────────────────────────────────────────── */}
      <section className="rounded-3xl bg-linear-to-br from-brand-600 to-brand-800 px-6 py-7 text-white">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar
              profile={profile}
              email={user?.email}
              size={84}
              className="!ring-4 !ring-white/30"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              aria-label="Change profile photo"
              className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-white text-brand-700 shadow-md transition hover:bg-brand-50 disabled:opacity-70"
            >
              {photoBusy ? <Spinner className="h-4 w-4" /> : <IconCamera className="h-4.5 w-4.5" />}
            </button>
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold tracking-tight">
              {profile?.name || "Administrator"}
            </h1>
            <p className="truncate text-white/85">{profile?.role || "Admin"}</p>
            <p className="mt-0.5 truncate text-sm text-white/65">{user?.email}</p>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handlePhoto(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={photoBusy}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-70"
          >
            <IconCamera className="h-4 w-4" />
            {profile?.photoUrl ? "Change photo" : "Upload photo"}
          </button>
          {profile?.photoUrl && (
            <button
              type="button"
              onClick={() => setConfirmPhoto(true)}
              disabled={photoBusy}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
            >
              <IconTrash className="h-4 w-4" />
              Remove
            </button>
          )}
        </div>
      </section>

      {/* ── stats ───────────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard
          icon={<IconImage className="h-4.5 w-4.5" />}
          value={posts.length}
          label={posts.length === 1 ? "Cutting archived" : "Cuttings archived"}
        />
        <StatCard
          icon={<IconFolder className="h-4.5 w-4.5" />}
          value={boards.length}
          label={boards.length === 1 ? "Collection" : "Collections"}
        />
      </div>

      {/* ── account ─────────────────────────────────────────────── */}
      <section className="mt-4 rounded-3xl border border-black/8 p-5 sm:p-6">
        <h2 className="text-lg font-bold tracking-tight text-ink-900">Account</h2>
        <div className="mt-4 space-y-2.5">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <IconLogout className="h-5 w-5" />
            Sign out
          </button>

        </div>
      </section>

      <p className="mt-6 text-center text-xs text-ink-500">
        {COLLEGE.name}, {COLLEGE.city} · News Desk
      </p>

      <ConfirmDialog
        open={confirmPhoto}
        title="Remove profile photo?"
        message="Your initials will be shown instead. You can upload a new photo any time."
        confirmLabel="Remove photo"
        busy={photoBusy}
        onCancel={() => setConfirmPhoto(false)}
        onConfirm={removePhoto}
      />

    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="rounded-2xl border border-black/8 px-4 py-3.5">
      <span className="flex items-center gap-2 text-ink-500">{icon}</span>
      <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink-900">{value}</p>
      <p className="text-[13px] text-ink-500">{label}</p>
    </div>
  );
}
