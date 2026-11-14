"use client";

import Image from "next/image";
import { useState } from "react";
import type { ActionState } from "@/lib/action-state";
import { INVALID_YOUTUBE_URL } from "@/lib/validation/chapter";
import { parseYouTubeId, youtubeThumbnailUrl } from "@/lib/youtube";
import { ActionForm } from "./action-form";
import { CheckboxField, MARKDOWN_HINT, TextAreaField, TextField, type FieldErrors } from "./fields";
import { SlugFields } from "./slug-fields";

export type ChapterFormValues = {
  title: string;
  slug: string;
  description: string | null;
  youtubeUrl: string;
  isPublished: boolean;
};

type Props = {
  action: (formData: FormData) => Promise<ActionState>;
  courseSlug: string;
  /** Omit for a new chapter. */
  chapter?: ChapterFormValues;
};

export function ChapterForm({ action, courseSlug, chapter }: Props) {
  const isNew = !chapter;

  return (
    <ActionForm
      action={action}
      submitLabel={isNew ? "Create chapter" : "Save changes"}
      pendingLabel={isNew ? "Creating…" : "Saving…"}
    >
      {(errors) => (
        <>
          <SlugFields
            defaultTitle={chapter?.title}
            defaultSlug={chapter?.slug}
            autoSlug={isNew}
            isPublished={chapter?.isPublished}
            urlPrefix={`/courses/${courseSlug}/`}
            errors={errors}
          />
          <YouTubeField defaultValue={chapter?.youtubeUrl ?? ""} errors={errors} />
          <TextAreaField
            name="description"
            label="Description (optional)"
            rows={8}
            defaultValue={chapter?.description ?? ""}
            hint={MARKDOWN_HINT}
            errors={errors}
          />
          <CheckboxField
            name="isPublished"
            label="Published"
            hint="Visible to students (the course must be published too)."
            defaultChecked={chapter?.isPublished}
          />
        </>
      )}
    </ActionForm>
  );
}

function YouTubeField({ defaultValue, errors }: { defaultValue: string; errors: FieldErrors }) {
  const [url, setUrl] = useState(defaultValue);
  const videoId = parseYouTubeId(url);
  const showLiveError = url.trim() !== "" && !videoId && !errors.youtubeUrl;

  return (
    <div className="space-y-3">
      <TextField
        name="youtubeUrl"
        label="YouTube URL"
        type="url"
        inputMode="url"
        required
        placeholder="https://www.youtube.com/watch?v=…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        errors={errors}
        hint={
          showLiveError ? (
            <span className="text-accent">{INVALID_YOUTUBE_URL}</span>
          ) : (
            "watch, youtu.be, shorts and embed links all work."
          )
        }
      />
      {videoId && (
        <figure className="flex items-center gap-4">
          <Image
            src={youtubeThumbnailUrl(videoId)}
            alt="Video thumbnail preview"
            width={192}
            height={144}
            className="aspect-video w-48 rounded-lg border border-border object-cover"
          />
          <figcaption className="text-xs text-muted">
            Video ID <span className="font-mono text-foreground">{videoId}</span>
            <br />
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Open on YouTube
            </a>
          </figcaption>
        </figure>
      )}
    </div>
  );
}
