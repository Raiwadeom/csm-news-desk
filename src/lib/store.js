"use client";

// Every read and write the app makes against Cloud Firestore.
//
//   posts/{id}   one newspaper cutting
//   boards/{id}  one collection
//   admins/{uid} one administrator's profile card

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from "firebase/firestore";

import { getDb } from "./firebase";

function db() {
  const instance = getDb();
  if (!instance) throw new Error("Firebase is not configured.");
  return instance;
}

/* ───────────────────────────── posts ───────────────────────────── */

export function subscribePosts(cb, onError) {
  const q = query(collection(db(), "posts"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      cb([]);
      onError?.(err);
    }
  );
}

export async function addPost(data) {
  const ref = await addDoc(collection(db(), "posts"), {
    title: data.title || "",
    note: data.note || "",
    imageUrl: data.imageUrl,
    publicId: data.publicId || null,
    width: data.width || 800,
    height: data.height || 1000,
    boardIds: data.boardIds || [],
    ownerUid: data.ownerUid || null,
    ownerName: data.ownerName || "",
    source: data.source || "",
    newsDate: data.newsDate || null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deletePost(post, idToken) {
  await deleteDoc(doc(db(), "posts", post.id));

  // Free the bytes in Cloudinary too - best effort, never blocks the UI.
  if (post.publicId) {
    fetch("/api/cloudinary/destroy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId: post.publicId, idToken }),
    }).catch(() => {});
  }
}

export async function setPostBoard(postId, boardId, shouldBeIn) {
  await updateDoc(doc(db(), "posts", postId), {
    boardIds: shouldBeIn ? arrayUnion(boardId) : arrayRemove(boardId),
  });
}

export async function updatePost(postId, patch) {
  await updateDoc(doc(db(), "posts", postId), patch);
}

/* ──────────────────────────── boards ───────────────────────────── */

export function subscribeBoards(cb, onError) {
  const q = query(collection(db(), "boards"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      cb([]);
      onError?.(err);
    }
  );
}

export async function createBoard({ name, description = "", ownerUid = null }) {
  const ref = await addDoc(collection(db(), "boards"), {
    name: name.trim(),
    description,
    ownerUid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function renameBoard(id, name, description) {
  const patch = { name: name.trim() };
  if (description !== undefined) patch.description = description;
  await updateDoc(doc(db(), "boards", id), patch);
}

/** Removes the collection. The cuttings themselves stay in the main feed. */
export async function deleteBoard(id, posts = []) {
  const affected = posts.filter((p) => (p.boardIds || []).includes(id));
  const batch = writeBatch(db());
  affected.forEach((p) =>
    batch.update(doc(db(), "posts", p.id), { boardIds: arrayRemove(id) })
  );
  batch.delete(doc(db(), "boards", id));
  await batch.commit();
}

/* ──────────────────────────── profile ──────────────────────────── */

export function subscribeProfile(uid, cb) {
  if (!uid) {
    cb(null);
    return () => {};
  }
  return onSnapshot(
    doc(db(), "admins", uid),
    (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    () => cb(null)
  );
}

export async function saveProfile(uid, patch) {
  if (!uid) return;
  await setDoc(doc(db(), "admins", uid), patch, { merge: true });
}

export async function readProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db(), "admins", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
