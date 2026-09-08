"use client";

import { useEffect, useState } from "react";
import MasonryGrid from "./MasonryGrid";
import Lightbox from "./Lightbox";
import { ConfirmDialog } from "./ui";
import { useToast } from "./Toast";
import { useAuth } from "@/lib/auth";
import { deletePost } from "@/lib/store";
import { thumbUrl } from "@/lib/images";

/**
 * The grid plus everything that hangs off a pin: full-screen view and the
 * delete confirmation. Shared by the main feed and each collection page.
 */
export default function PinBrowser({ posts, boardsById, readOnly = false }) {
  const { getIdToken } = useAuth();
  const { toast, error: toastError } = useToast();

  const [active, setActive] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  // Keep the open pin in sync when the underlying list changes.
  useEffect(() => {
    if (!active) return;
    const fresh = posts.find((p) => p.id === active.id);
    if (!fresh) setActive(null);
    else if (fresh !== active) setActive(fresh);
  }, [posts, active]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      const token = await getIdToken();
      await deletePost(pendingDelete, token);
      toast("Cutting deleted.");
      setPendingDelete(null);
      setActive(null);
    } catch (err) {
      toastError(err.message || "Could not delete that cutting.");
    }
    setBusy(false);
  }

  return (
    <>
      <MasonryGrid
        posts={posts}
        boardsById={boardsById}
        onOpen={setActive}
        readOnly={readOnly}
      />

      <Lightbox
        post={active}
        boardsById={boardsById}
        onClose={() => setActive(null)}
        onDelete={readOnly ? undefined : setPendingDelete}
        readOnly={readOnly}
      />

      {!readOnly && (
        <ConfirmDialog
          open={Boolean(pendingDelete)}
          title="Delete this cutting?"
          message={`"${
            pendingDelete?.title || "This cutting"
          }" will be removed from the feed and from every collection. This cannot be undone.`}
          confirmLabel="Delete"
          previewSrc={pendingDelete ? thumbUrl(pendingDelete.imageUrl, 500) : ""}
          previewAlt={pendingDelete?.title || ""}
          busy={busy}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
