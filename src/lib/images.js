"use client";

const CLOUDINARY_UPLOAD_MARKER = "/image/upload/";

function isCloudinary(url = "") {
  return url.includes("res.cloudinary.com") && url.includes(CLOUDINARY_UPLOAD_MARKER);
}

function withTransform(url, transform) {
  const [head, tail] = url.split(CLOUDINARY_UPLOAD_MARKER);
  return `${head}${CLOUDINARY_UPLOAD_MARKER}${transform}/${tail}`;
}

/** Grid-sized, auto-format, auto-quality version of an image. */
export function thumbUrl(url, width = 600) {
  if (!url || !isCloudinary(url)) return url;
  return withTransform(url, `f_auto,q_auto,w_${width},c_limit`);
}

/** Full-resolution-but-optimised version used in the lightbox. */
export function largeUrl(url) {
  if (!url || !isCloudinary(url)) return url;
  return withTransform(url, "f_auto,q_auto,w_1600,c_limit");
}

export function safeFileName(name) {
  const base = (name || "newspaper-clipping")
    .trim()
    // Dots become hyphens rather than being kept: Cloudinary answers 400 to
    // any fl_attachment whose filename contains one, which silently broke
    // every download of a cutting titled from a WhatsApp filename
    // ("WhatsApp Image 2021 09 20 at 3.50.06 PM"). Turning them into
    // hyphens keeps dated titles readable - "09.07.2021" -> "09-07-2021".
    .replace(/\./g, "-")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return base || "newspaper-clipping";
}

/**
 * Saves an image to the device. Works on desktop and on mobile browsers.
 *
 * The blob path goes first because it is the only one that can report
 * whether the save actually happened - and it names the file exactly. If it
 * cannot run (CORS, or an offline cache miss) Cloudinary's own
 * `fl_attachment` is tried, and a new tab is the last resort.
 */
export async function downloadImage(url, title) {
  const name = safeFileName(title);
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const objectUrl = URL.createObjectURL(blob);
    triggerAnchor(objectUrl, `${name}.${ext}`);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    return true;
  } catch {
    if (isCloudinary(url)) {
      triggerAnchor(withTransform(url, `fl_attachment:${name}`), `${name}.jpg`);
      return true;
    }
    // Let the browser handle it; the user can long-press / right-click to save.
    window.open(url, "_blank", "noopener");
    return false;
  }
}

function triggerAnchor(href, download) {
  const a = document.createElement("a");
  a.href = href;
  a.download = download;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
