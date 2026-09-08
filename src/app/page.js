"use client";

import { useEffect, useState } from "react";
import PublicHeader from "@/components/PublicHeader";
import PinBrowser from "@/components/PinBrowser";
import EmptyState from "@/components/EmptyState";
import { IconImage } from "@/components/Icons";
import { subscribePosts } from "@/lib/store";

/**
 * The public front door of the archive. No sign-in required: anyone can
 * browse every published cutting and open it full-screen. Searching,
 * downloading, uploading, collections and deleting all stay behind /login.
 */
export default function PublicFeedPage() {
  const [posts, setPosts] = useState([]);
  const [ready, setReady] = useState(false);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    try {
      const unsub = subscribePosts(
        (rows) => {
          setPosts(rows);
          setReady(true);
        },
        (err) => {
          setDataError(err?.message || "Could not load the archive right now.");
          setReady(true);
        }
      );
      return unsub;
    } catch (err) {
      setDataError(err?.message || "Could not load the archive right now.");
      setReady(true);
    }
  }, []);

  const isEmpty = ready && posts.length === 0;

  return (
    <div className="min-h-dvh bg-white">
      <PublicHeader />

      <main className="mx-auto max-w-[1800px] px-3 pb-10 pt-4 sm:px-5">
        {dataError && (
          <p role="alert" className="mb-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
            {dataError}
          </p>
        )}

        {!ready && <SkeletonGrid />}

        {ready && posts.length > 0 && <PinBrowser posts={posts} readOnly />}

        {isEmpty && (
          <EmptyState
            icon={<IconImage className="h-7 w-7" />}
            title="The archive is empty"
            body="Newspaper cuttings uploaded by the college administrators will appear here."
          />
        )}
      </main>
    </div>
  );
}

function SkeletonGrid() {
  const heights = [220, 320, 180, 280, 240, 340, 200, 300, 260, 190, 310, 230];
  return (
    <div className="masonry columns-2 sm:columns-3 md:columns-4 lg:columns-5 2xl:columns-6">
      {heights.map((h, i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-black/6" style={{ height: h }} />
      ))}
    </div>
  );
}
