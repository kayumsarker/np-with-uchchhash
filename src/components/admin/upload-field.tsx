"use client";

import { FileText, ImageUp, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import {
  checkFile,
  formatBytes,
  UPLOAD_KINDS,
  type StoredAsset,
  type UploadKind,
  type UploadSignature,
} from "@/lib/uploads";
import type { FieldErrors } from "./fields";
import { btn } from "./styles";

type Props = {
  kind: UploadKind;
  /** Hidden input name; its value is the Cloudinary public ID ("" = no file). */
  name: string;
  label: string;
  initial: StoredAsset | null;
  errors?: FieldErrors;
  hint?: string;
  /** Image preview + rounded crop for photos. */
  preview?: "image" | "avatar" | "file";
};

type Status =
  | { state: "idle" }
  | { state: "uploading"; progress: number }
  | { state: "error"; message: string };

/**
 * Uploads straight from the browser to Cloudinary with a signature from
 * /api/cloudinary/sign. The form only submits the resulting public ID; the
 * server verifies it before saving and deletes the replaced file afterwards.
 */
export function UploadField({
  kind,
  name,
  label,
  initial,
  errors,
  hint,
  preview = "image",
}: Props) {
  const [asset, setAsset] = useState<StoredAsset | null>(initial);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const config = UPLOAD_KINDS[kind];
  const serverError = errors?.[name]?.[0];
  const message = status.state === "error" ? status.message : serverError;
  const uploading = status.state === "uploading";
  const changed = asset?.publicId !== initial?.publicId;

  async function handleFile(file: File) {
    const problem = checkFile(kind, file);
    if (problem) {
      setStatus({ state: "error", message: problem });
      return;
    }
    setStatus({ state: "uploading", progress: 0 });
    try {
      const uploaded = await uploadToCloudinary(kind, file, (progress) =>
        setStatus({ state: "uploading", progress }),
      );
      setAsset(uploaded);
      setFileName(file.name);
      setStatus({ state: "idle" });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Upload failed. Try again.",
      });
    }
  }

  return (
    <div className="space-y-2" data-uploading={uploading ? "true" : undefined}>
      <input type="hidden" name={name} value={asset?.publicId ?? ""} />
      <span id={`${id}-label`} className="block text-sm font-medium">
        {label}
      </span>

      {asset && <AssetPreview asset={asset} fileName={fileName} preview={preview} />}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={config.accept}
          className="sr-only"
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-hint`}
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = ""; // allow picking the same file again
            if (file) void handleFile(file);
          }}
        />
        <button
          type="button"
          disabled={uploading}
          className={`${btn.base} ${btn.secondary}`}
          onClick={() => inputRef.current?.click()}
        >
          <ImageUp className="size-4" aria-hidden />
          {asset ? "Replace file" : "Choose file"}
        </button>
        {asset && !uploading && (
          <button
            type="button"
            className={`${btn.base} ${btn.ghostDanger}`}
            onClick={() => {
              setAsset(null);
              setStatus({ state: "idle" });
            }}
          >
            <X className="size-4" aria-hidden />
            Remove
          </button>
        )}
        {changed && initial && !uploading && (
          <button
            type="button"
            className={`${btn.base} ${btn.secondary}`}
            onClick={() => {
              setAsset(initial);
              setFileName(null);
              setStatus({ state: "idle" });
            }}
          >
            <RotateCcw className="size-4" aria-hidden />
            Undo
          </button>
        )}
      </div>

      {uploading && (
        <div className="flex items-center gap-3 text-xs text-muted" role="status">
          <progress
            value={status.progress}
            max={100}
            className="h-2 w-48 overflow-hidden rounded-full accent-primary"
          />
          Uploading… {status.progress}%
        </div>
      )}

      <p id={`${id}-hint`} className="text-xs text-muted">
        {hint ? `${hint} ` : ""}
        {config.extensions.join(", ").toUpperCase()} · max {formatBytes(config.maxBytes)}.
        {changed && " Click save to apply."}
      </p>
      {message && (
        <p className="text-sm text-red-300" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}

function AssetPreview({
  asset,
  fileName,
  preview,
}: {
  asset: StoredAsset;
  fileName: string | null;
  preview: "image" | "avatar" | "file";
}) {
  if (preview === "file") {
    return (
      <a
        href={asset.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-fit items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:border-primary"
      >
        <FileText className="size-4 text-secondary" aria-hidden />
        {fileName ?? asset.publicId.split("/").pop()}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Image
      src={asset.url}
      alt="Current image preview"
      width={preview === "avatar" ? 128 : 320}
      height={preview === "avatar" ? 128 : 180}
      className={`border border-border object-cover ${
        preview === "avatar" ? "size-32 rounded-full" : "aspect-video w-80 max-w-full rounded-lg"
      }`}
    />
  );
}

async function uploadToCloudinary(
  kind: UploadKind,
  file: File,
  onProgress: (percent: number) => void,
): Promise<StoredAsset> {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  });
  if (signRes.status === 401) throw new Error("Your session expired. Log in again.");
  if (!signRes.ok) throw new Error("Could not start the upload. Try again.");
  const sig = (await signRes.json()) as UploadSignature;

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", sig.apiKey);
  body.append("timestamp", String(sig.timestamp));
  body.append("signature", sig.signature);
  body.append("folder", sig.folder);
  body.append("allowed_formats", sig.allowedFormats);

  // XHR (not fetch) for upload progress events.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", sig.uploadUrl);
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      const json = xhr.response as {
        public_id?: string;
        secure_url?: string;
        error?: { message?: string };
      } | null;
      if (xhr.status === 200 && json?.public_id && json.secure_url) {
        resolve({ publicId: json.public_id, url: json.secure_url });
      } else {
        reject(new Error(json?.error?.message ?? `Upload failed (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload. Try again."));
    xhr.send(body);
  });
}
