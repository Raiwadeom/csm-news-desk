"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Button, Field, inputClass } from "./ui";
import { IconUpload, IconClose, IconImage, Spinner } from "./Icons";
import { useToast } from "./Toast";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/app-context";
import { addPost, createBoard } from "@/lib/store";
import { uploadImage, validateImageFile } from "@/lib/upload";
import { isCloudinaryConfigured } from "@/lib/config";
import { todayInputValue } from "@/lib/dates";

const NEW_BOARD = "__new__";

const titleFromFile = (name) =>
  name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

export default function UploadModal() {
  const { uploadState, closeUpload, boards } = useApp();
  const { user, profile } = useAuth();
  const { toast, error: toastError } = useToast();

  const [items, setItems] = useState([]);
  const [boardId, setBoardId] = useState("");
  const [newBoardName, setNewBoardName] = useState("");
  const [source, setSource] = useState("");
  const [newsDate, setNewsDate] = useState(todayInputValue());
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const open = uploadState.open;

  // Reset the form each time the dialog is opened.
  useEffect(() => {
    if (!open) return;
    setItems([]);
    setBoardId(uploadState.boardId || "");
    setNewBoardName("");
    setSource("");
    setNewsDate(todayInputValue());
    setBusy(false);
  }, [open, uploadState.boardId]);

  const addFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList || []);
      const accepted = [];
      for (const file of incoming) {
        const problem = validateImageFile(file);
        if (problem) {
          toastError(problem);
          continue;
        }
        accepted.push({
          key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          title: titleFromFile(file.name),
          preview: URL.createObjectURL(file),
          progress: 0,
          status: "pending",
        });
      }
      if (accepted.length) setItems((list) => [...list, ...accepted]);
    },
    [toastError]
  );

  function removeItem(key) {
    setItems((list) => {
      const target = list.find((i) => i.key === key);
      if (target) URL.revokeObjectURL(target.preview);
      return list.filter((i) => i.key !== key);
    });
  }

  function setItemField(key, patch) {
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  async function handleUpload() {
    if (!items.length || busy) return;
    setBusy(true);

    try {
      let targetBoardId = boardId;
      if (boardId === NEW_BOARD) {
        if (!newBoardName.trim()) {
          toastError("Give the new collection a name.");
          setBusy(false);
          return;
        }
        targetBoardId = await createBoard({
          name: newBoardName,
          ownerUid: user?.uid || null,
        });
      }

      let done = 0;
      for (const item of items) {
        if (item.status === "done") continue;
        setItemField(item.key, { status: "uploading", progress: 0 });
        try {
          const uploaded = await uploadImage(item.file, {
            folder: "csm-news",
            onProgress: (p) => setItemField(item.key, { progress: p }),
          });
          await addPost({
            title: item.title || titleFromFile(item.file.name),
            source: source.trim(),
            newsDate: newsDate || null,
            imageUrl: uploaded.imageUrl,
            publicId: uploaded.publicId,
            width: uploaded.width,
            height: uploaded.height,
            boardIds: targetBoardId ? [targetBoardId] : [],
            ownerUid: user?.uid || null,
            ownerName: profile?.name || "",
          });
          setItemField(item.key, { status: "done", progress: 100 });
          done += 1;
        } catch (err) {
          setItemField(item.key, { status: "failed", error: err.message });
          toastError(`${item.title || item.file.name}: ${err.message}`);
        }
      }

      if (done > 0) {
        toast(done === 1 ? "Cutting added to the feed." : `${done} cuttings added to the feed.`);
        closeUpload();
      } else {
        setBusy(false);
      }
    } catch (err) {
      toastError(err.message || "Upload failed.");
      setBusy(false);
    }
  }

  const totalReady = items.filter((i) => i.status !== "done").length;

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : closeUpload}
      title="Upload newspaper cuttings"
      subtitle="JPG or PNG, up to 10 MB each. Portrait and landscape both work."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={closeUpload} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={busy || !items.length}>
            {busy && <Spinner className="h-4 w-4" />}
            {busy
              ? "Uploading…"
              : `Publish${totalReady ? ` ${totalReady} cutting${totalReady > 1 ? "s" : ""}` : ""}`}
          </Button>
        </>
      }
    >
      {/* dropzone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragging
            ? "border-brand-500 bg-brand-50"
            : "border-black/12 bg-black/[0.02] hover:border-brand-300 hover:bg-brand-50/50"
        }`}
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-white">
          <IconUpload />
        </span>
        <span className="text-[15px] font-semibold text-ink-900">
          Tap to choose images
        </span>
        <span className="text-sm text-ink-500">
          or drag them here · you can select several at once
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* selected files */}
      {items.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-start gap-3 rounded-2xl bg-black/[0.03] p-2.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.preview}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <input
                  value={item.title}
                  onChange={(e) => setItemField(item.key, { title: e.target.value })}
                  placeholder="Headline / caption"
                  disabled={busy}
                  className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
                />
                <div className="mt-1.5 flex items-center gap-2">
                  {item.status === "uploading" && (
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-brand-600 transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.status === "done" && (
                    <span className="text-xs font-semibold text-green-700">Published</span>
                  )}
                  {item.status === "failed" && (
                    <span className="text-xs font-semibold text-brand-700">
                      Failed — {item.error}
                    </span>
                  )}
                  {item.status === "pending" && (
                    <span className="text-xs text-ink-500">
                      {(item.file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  )}
                </div>
              </div>
              {!busy && (
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  aria-label="Remove"
                  className="shrink-0 rounded-full p-1.5 text-ink-500 transition hover:bg-black/8 hover:text-ink-900"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* shared fields */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Add to collection" htmlFor="board">
          <select
            id="board"
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            disabled={busy}
            className={inputClass}
          >
            <option value="">Main feed only</option>
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
            <option value={NEW_BOARD}>+ Create a new collection…</option>
          </select>
        </Field>

        <Field label="Newspaper (optional)" htmlFor="source">
          <input
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Lokmat, Sakal, Divya Marathi…"
            disabled={busy}
            className={inputClass}
          />
        </Field>

        <Field
          label="Date of publication"
          htmlFor="newsDate"
          hint="The date the story ran in the paper — shown on the cutting to everyone."
        >
          <input
            id="newsDate"
            type="date"
            value={newsDate}
            onChange={(e) => setNewsDate(e.target.value)}
            disabled={busy}
            className={inputClass}
          />
        </Field>

        {boardId === NEW_BOARD && (
          <div className="sm:col-span-2">
            <Field label="New collection name" htmlFor="newBoard">
              <input
                id="newBoard"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Shivjayanti 2026"
                disabled={busy}
                className={inputClass}
                autoFocus
              />
            </Field>
          </div>
        )}
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs text-ink-500">
        <IconImage className="mt-px h-4 w-4 shrink-0" />
        {isCloudinaryConfigured
          ? "Images are stored on Cloudinary and served optimised on every device."
          : "Demo mode: images are saved in this browser only. Add Cloudinary keys to store them in the cloud."}
      </p>
    </Modal>
  );
}
