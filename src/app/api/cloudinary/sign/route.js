import crypto from "crypto";
import { bearerToken, isSameOrigin, verifyAdmin } from "@/lib/server-auth";

export const runtime = "nodejs";

// The only folders the app ever uploads into.
const ALLOWED_FOLDERS = new Set(["csm-news", "csm-news/avatars"]);

/**
 * Mints a short-lived signature so the browser can upload straight to
 * Cloudinary. The API secret stays on the server, and only a signed-in
 * administrator can get a signature.
 */
export async function POST(request) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json(
      { error: "Cloudinary is not configured on the server." },
      { status: 500 }
    );
  }

  if (!isSameOrigin(request)) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }
  if (!(await verifyAdmin(bearerToken(request)))) {
    return Response.json({ error: "Not authorised." }, { status: 401 });
  }

  let folder = "csm-news";
  try {
    const body = await request.json();
    if (ALLOWED_FOLDERS.has(body?.folder)) folder = body.folder;
  } catch {
    // keep the default folder
  }

  const timestamp = Math.round(Date.now() / 1000);
  // Params must be signed in alphabetical order, secret appended at the end.
  // Signing allowed_formats means Cloudinary refuses anything but images.
  const allowedFormats = "jpg,jpeg,png,webp,gif,heic,heif,avif";
  const signature = crypto
    .createHash("sha1")
    .update(
      `allowed_formats=${allowedFormats}&folder=${folder}&timestamp=${timestamp}${apiSecret}`
    )
    .digest("hex");

  return Response.json({ signature, timestamp, apiKey, cloudName, folder, allowedFormats });
}
