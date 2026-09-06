"use client";

import { useEffect, useState } from "react";
import { Modal, Button, Field, inputClass, ConfirmDialog } from "./ui";
import { Spinner, IconTrash } from "./Icons";
import { useToast } from "./Toast";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/app-context";
import { createBoard, renameBoard, deleteBoard } from "@/lib/store";

const SUGGESTIONS = [
  "Shivjayanti",
  "Annual Gathering",
  "Sports",
  "NSS & NCC",
  "Academics",
  "Convocation",
  "Cultural Events",
];

export default function BoardModal({ onDeleted }) {
  const { boardState, closeBoard, posts } = useApp();
  const { user } = useAuth();
  const { toast, error: toastError } = useToast();

  const editing = boardState.board;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!boardState.open) return;
    setName(editing?.name || "");
    setDescription(editing?.description || "");
    setBusy(false);
    setConfirmDelete(false);
  }, [boardState.open, editing]);

  async function handleSave() {
    if (!name.trim()) {
      toastError("Give the collection a name.");
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await renameBoard(editing.id, name, description);
        toast("Collection updated.");
      } else {
        await createBoard({ name, description, ownerUid: user?.uid || null });
        toast(`Collection "${name.trim()}" created.`);
      }
      closeBoard();
    } catch (err) {
      toastError(err.message || "Could not save the collection.");
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteBoard(editing.id, posts);
      toast("Collection deleted. Its cuttings are still in the feed.");
      setConfirmDelete(false);
      closeBoard();
      onDeleted?.(editing.id);
    } catch (err) {
      toastError(err.message || "Could not delete the collection.");
      setBusy(false);
    }
  }

  return (
    <>
      <Modal
        open={boardState.open && !confirmDelete}
        onClose={busy ? () => {} : closeBoard}
        title={editing ? "Edit collection" : "Create a collection"}
        subtitle={
          editing
            ? "Rename it or update its description."
            : "Group cuttings by event — Shivjayanti, Sports, Annual Gathering."
        }
        footer={
          <>
            {editing && (
              <Button
                variant="ghost"
                onClick={() => setConfirmDelete(true)}
                disabled={busy}
                className="mr-auto !text-brand-700"
              >
                <IconTrash className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button variant="ghost" onClick={closeBoard} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={busy || !name.trim()}>
              {busy && <Spinner className="h-4 w-4" />}
              {editing ? "Save changes" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" htmlFor="boardName">
            <input
              id="boardName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shivjayanti"
              maxLength={60}
              autoFocus
              className={inputClass}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="boardDesc"
            hint="Optional — a line about what belongs in this collection."
          >
            <textarea
              id="boardDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={160}
              placeholder="Press coverage of Shiv Jayanti celebrations"
              className={`${inputClass} resize-none`}
            />
          </Field>

          {!editing && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
                Quick picks
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setName(s)}
                    className="rounded-full bg-black/6 px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:bg-black/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${editing?.name}"?`}
        message="The collection will be removed. The cuttings inside it stay in the main feed and are not deleted."
        confirmLabel="Delete collection"
        busy={busy}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
