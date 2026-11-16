"use client";

import type { ActionState } from "@/lib/action-state";
import { ActionForm } from "./action-form";
import { MARKDOWN_HINT, TextAreaField, TextField } from "./fields";
import { UploadField } from "./upload-field";

export type SettingsFormValues = {
  tutorName: string;
  tagline: string;
  aboutContent: string;
  youtubeUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  photoUrl: string | null;
  photoPublicId: string | null;
};

type Props = {
  action: (formData: FormData) => Promise<ActionState>;
  settings: SettingsFormValues | null;
};

export function SettingsForm({ action, settings }: Props) {
  return (
    <ActionForm action={action} submitLabel="Save settings" pendingLabel="Saving…">
      {(errors) => (
        <>
          <TextField
            name="tutorName"
            label="Tutor name"
            required
            maxLength={80}
            defaultValue={settings?.tutorName}
            errors={errors}
          />
          <TextField
            name="tagline"
            label="Tagline"
            required
            maxLength={160}
            defaultValue={settings?.tagline}
            hint="Short line shown on the home page."
            errors={errors}
          />
          <UploadField
            kind="tutorPhoto"
            name="photoPublicId"
            label="Tutor photo (optional)"
            preview="avatar"
            initial={
              settings?.photoUrl && settings.photoPublicId
                ? { url: settings.photoUrl, publicId: settings.photoPublicId }
                : null
            }
            hint="Square photo, shown on the About page."
            errors={errors}
          />
          <TextAreaField
            name="aboutContent"
            label="About page content"
            required
            rows={12}
            defaultValue={settings?.aboutContent}
            hint={MARKDOWN_HINT}
            errors={errors}
          />
          <fieldset className="space-y-4">
            <legend className="mb-1 font-heading text-lg font-bold">Social links</legend>
            <p className="text-xs text-muted">Optional. Leave empty to hide the icon.</p>
            <TextField
              name="youtubeUrl"
              label="YouTube"
              type="url"
              inputMode="url"
              placeholder="https://www.youtube.com/@…"
              defaultValue={settings?.youtubeUrl ?? ""}
              errors={errors}
            />
            <TextField
              name="facebookUrl"
              label="Facebook"
              type="url"
              inputMode="url"
              placeholder="https://www.facebook.com/…"
              defaultValue={settings?.facebookUrl ?? ""}
              errors={errors}
            />
            <TextField
              name="instagramUrl"
              label="Instagram"
              type="url"
              inputMode="url"
              placeholder="https://www.instagram.com/…"
              defaultValue={settings?.instagramUrl ?? ""}
              errors={errors}
            />
          </fieldset>
        </>
      )}
    </ActionForm>
  );
}
