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
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return base || "newspaper-clipping";
}

/**
 * Saves an image to the device. Works on desktop and on mobile browsers.
 * Cloudinary gets an `fl_attachment` URL (most reliable on iOS/Android);
 * everything else is fetched as a blob and handed to a download anchor.
 */
export async function downloadImage(url, title) {
  const name = safeFileName(title);
  try {
    if (isCloudinary(url)) {
      triggerAnchor(withTransform(url, `fl_attachment:${name}`), `${name}.jpg`);
      return true;
    }
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const objectUrl = URL.createObjectURL(blob);
    triggerAnchor(objectUrl, `${name}.${ext}`);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    return true;
  } catch {
    // Last resort: let the browser handle it in a new tab
    // (user can then long-press / right-click to save).
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
