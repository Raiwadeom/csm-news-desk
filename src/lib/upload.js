"use client";

import { cloudinaryCloudName, isCloudinaryConfigured } from "./config";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateImageFile(file) {
  if (!file.type.startsWith("image/")) {
    return `"${file.name}" is not an image file.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `"${file.name}" is larger than 10 MB.`;
  }
  return null;
}

/**
 * Uploads one image and returns { imageUrl, publicId, width, height }.
 *
 * The file goes straight from the browser to Cloudinary using a short-lived
 * signature minted by our own API route, so the API secret never reaches the
 * client and large scans never pass through the serverless function.
 */
export async function uploadImage(file, { folder = "csm-news", onProgress } = {}) {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Add the Cloudinary keys to .env.local."
    );
  }

  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!signRes.ok) {
    throw new Error("Could not start the upload. Check the Cloudinary keys.");
  }
  const { signature, timestamp, apiKey } = await signRes.json();

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);
  form.append("folder", folder);

  const result = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`
    );
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(body);
        else reject(new Error(body?.error?.message || "Cloudinary rejected the upload."));
      } catch {
        reject(new Error("Unexpected response from Cloudinary."));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading."));
    xhr.send(form);
  });

  return {
    imageUrl: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}
