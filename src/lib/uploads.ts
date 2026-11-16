/**
 * Upload kinds shared by the browser (pre-checks, `accept`) and the server
 * (signature params + verification). Everything is stored as Cloudinary
 * resource_type "image" — PDFs included (PDF delivery is enabled on the account).
 */

const MB = 1024 * 1024;

const IMAGE = {
  /** Formats Cloudinary reports after upload (JPEG files are reported as "jpg"). */
  formats: ["jpg", "png", "webp", "avif"],
  extensions: ["jpg", "jpeg", "png", "webp", "avif"],
  accept: "image/jpeg,image/png,image/webp,image/avif",
  maxBytes: 5 * MB,
} as const;

const PDF = {
  formats: ["pdf"],
  extensions: ["pdf"],
  accept: "application/pdf",
  maxBytes: 10 * MB,
} as const;

export const UPLOAD_KINDS = {
  courseThumbnail: { ...IMAGE, folder: "courses" },
  tutorPhoto: { ...IMAGE, folder: "tutor" },
  resourceImage: { ...IMAGE, folder: "resources/images" },
  resourcePdf: { ...PDF, folder: "resources/pdfs" },
} as const;

export type UploadKind = keyof typeof UPLOAD_KINDS;

export const UPLOAD_KIND_NAMES = Object.keys(UPLOAD_KINDS) as [UploadKind, ...UploadKind[]];

export function formatBytes(bytes: number): string {
  return bytes >= MB
    ? `${(bytes / MB).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Browser-side check before uploading. Returns an error message or null. */
export function checkFile(kind: UploadKind, file: { name: string; size: number }): string | null {
  const { extensions, maxBytes } = UPLOAD_KINDS[kind];
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(extensions as readonly string[]).includes(ext)) {
    return `Unsupported file type. Allowed: ${extensions.join(", ")}.`;
  }
  if (file.size > maxBytes) {
    return `File is too large (${formatBytes(file.size)}). Maximum is ${formatBytes(maxBytes)}.`;
  }
  return null;
}

/** A stored Cloudinary asset as the admin forms see it. */
export type StoredAsset = { publicId: string; url: string };

/** Response of POST /api/cloudinary/sign. */
export type UploadSignature = {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
};
