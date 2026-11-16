import "server-only";
import { v2 as cloudinary } from "cloudinary";
import {
  formatBytes,
  UPLOAD_KINDS,
  type StoredAsset,
  type UploadKind,
  type UploadSignature,
} from "@/lib/uploads";

/**
 * Server-only Cloudinary access. The API secret never leaves this module:
 * the browser gets a short-lived signature and uploads directly to Cloudinary,
 * then the server re-checks the uploaded asset before saving it.
 */

const PUBLIC_ID_REGEX = /^[A-Za-z0-9_\-/]{1,255}$/;

function configure() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not set.");
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return { cloudName, apiKey, apiSecret };
}

/** Signature for one direct browser upload (valid for 1 hour, per Cloudinary). */
export function signUpload(kind: UploadKind): UploadSignature {
  const { cloudName, apiKey, apiSecret } = configure();
  const { folder, formats } = UPLOAD_KINDS[kind];

  // The browser must send exactly these params; Cloudinary rejects any change.
  const params = {
    timestamp: Math.round(Date.now() / 1000),
    folder,
    allowed_formats: formats.join(","),
  };

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    apiKey,
    timestamp: params.timestamp,
    signature: cloudinary.utils.api_sign_request(params, apiSecret),
    folder,
    allowedFormats: params.allowed_formats,
  };
}

function httpCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const inner = (error as { error?: { http_code?: unknown } }).error;
  return typeof inner?.http_code === "number" ? inner.http_code : undefined;
}

type VerifyResult = { ok: true; asset: StoredAsset } | { ok: false; error: string };

/**
 * Never trust a public ID sent by the form: confirm it exists, sits in this
 * kind's folder, has an allowed format and is within the size limit.
 * Oversized uploads are deleted.
 */
export async function verifyUpload(kind: UploadKind, publicId: string): Promise<VerifyResult> {
  if (!PUBLIC_ID_REGEX.test(publicId)) return { ok: false, error: "Invalid upload. Upload again." };
  configure();
  const { folder, formats, maxBytes } = UPLOAD_KINDS[kind];

  let resource: {
    public_id: string;
    asset_folder?: string;
    format: string;
    bytes: number;
    secure_url: string;
  };
  try {
    resource = await cloudinary.api.resource(publicId, { resource_type: "image", type: "upload" });
  } catch (error) {
    if (httpCode(error) === 404) {
      return { ok: false, error: "Uploaded file not found in Cloudinary. Upload it again." };
    }
    throw error;
  }

  const inFolder = resource.public_id.startsWith(`${folder}/`) || resource.asset_folder === folder;
  if (!inFolder || !(formats as readonly string[]).includes(resource.format)) {
    return { ok: false, error: "This file was not uploaded for this field. Upload again." };
  }
  if (resource.bytes > maxBytes) {
    await deleteAsset(resource.public_id);
    return {
      ok: false,
      error: `File is too large (${formatBytes(resource.bytes)}). Maximum is ${formatBytes(maxBytes)}.`,
    };
  }

  return { ok: true, asset: { publicId: resource.public_id, url: resource.secure_url } };
}

/**
 * Deletes an asset. Returns false (and logs) on failure instead of throwing:
 * a Cloudinary hiccup must never block the database change.
 * "not found" counts as success — the file is gone either way.
 */
export async function deleteAsset(publicId: string | null | undefined): Promise<boolean> {
  if (!publicId) return true;
  try {
    configure();
    const { result } = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
    if (result === "ok" || result === "not found") return true;
    console.error(`[cloudinary] destroy "${publicId}" returned "${result}"`);
    return false;
  } catch (error) {
    console.error(`[cloudinary] destroy "${publicId}" failed`, error);
    return false;
  }
}

export const CLEANUP_WARNING =
  "Saved, but the old file could not be removed from Cloudinary. You can delete it in the Cloudinary console.";

export type AssetChange =
  { type: "keep" } | { type: "remove" } | { type: "set"; asset: StoredAsset };

/**
 * Compares the public ID submitted by a form with the stored one and verifies
 * a new upload. After the DB write succeeds, call `cleanupOldAsset`.
 */
export async function resolveAssetChange(
  kind: UploadKind,
  submitted: string | null,
  current: string | null,
): Promise<{ ok: true; change: AssetChange } | { ok: false; error: string }> {
  if (submitted === current) return { ok: true, change: { type: "keep" } };
  if (!submitted) return { ok: true, change: { type: "remove" } };
  const verified = await verifyUpload(kind, submitted);
  return verified.ok ? { ok: true, change: { type: "set", asset: verified.asset } } : verified;
}

/** Deletes the previous file after a successful replace/remove. Returns a warning on failure. */
export async function cleanupOldAsset(
  change: AssetChange,
  current: string | null,
): Promise<string | undefined> {
  if (change.type === "keep" || !current) return undefined;
  return (await deleteAsset(current)) ? undefined : CLEANUP_WARNING;
}
