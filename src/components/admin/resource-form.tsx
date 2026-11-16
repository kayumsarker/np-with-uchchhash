"use client";

import { useState } from "react";
import type { Category, ResourceType } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/action-state";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import type { StoredAsset } from "@/lib/uploads";
import { ActionForm } from "./action-form";
import { CheckboxField, Field, MARKDOWN_HINT, TextAreaField, TextField } from "./fields";
import { inputClass } from "./styles";
import { UploadField } from "./upload-field";

export type ResourceFormValues = {
  title: string;
  description: string | null;
  type: ResourceType;
  /** Link URL for LINK resources. */
  url: string;
  file: StoredAsset | null;
  category: Category | null;
  chapterId: string | null;
  isPublished: boolean;
};

export type ChapterOptionGroup = {
  courseId: string;
  courseTitle: string;
  chapters: { id: string; title: string }[];
};

type Props = {
  action: (formData: FormData) => Promise<ActionState>;
  chapterGroups: ChapterOptionGroup[];
  /** Omit for a new resource. */
  resource?: ResourceFormValues;
};

const TYPE_OPTIONS: { value: ResourceType; label: string; hint: string }[] = [
  { value: "PDF", label: "PDF", hint: "Notes, worksheets" },
  { value: "IMAGE", label: "Image", hint: "Diagrams, charts" },
  { value: "LINK", label: "Link", hint: "Any web page" },
];

export function ResourceForm({ action, chapterGroups, resource }: Props) {
  const isNew = !resource;
  const [type, setType] = useState<ResourceType>(resource?.type ?? "PDF");
  // Keep the stored file only while the type matches it.
  const initialFile = resource && resource.type === type ? resource.file : null;

  return (
    <ActionForm
      action={action}
      submitLabel={isNew ? "Create resource" : "Save changes"}
      pendingLabel={isNew ? "Creating…" : "Saving…"}
    >
      {(errors) => (
        <>
          <TextField
            name="title"
            label="Title"
            required
            maxLength={160}
            defaultValue={resource?.title}
            errors={errors}
          />

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Type</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:ring-2 has-focus-visible:ring-primary"
                >
                  <input
                    type="radio"
                    name="type"
                    value={option.value}
                    checked={type === option.value}
                    onChange={() => setType(option.value)}
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-muted">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.type?.[0] && <p className="mt-1 text-sm text-red-300">{errors.type[0]}</p>}
          </fieldset>

          {type === "LINK" ? (
            <TextField
              name="linkUrl"
              label="Link URL"
              type="url"
              inputMode="url"
              required
              placeholder="https://…"
              defaultValue={resource?.type === "LINK" ? resource.url : ""}
              errors={errors}
            />
          ) : (
            <UploadField
              // Remount when the type changes so the file picker resets.
              key={type}
              kind={type === "PDF" ? "resourcePdf" : "resourceImage"}
              name="filePublicId"
              label={type === "PDF" ? "PDF file" : "Image file"}
              preview={type === "PDF" ? "file" : "image"}
              initial={initialFile}
              errors={errors}
            />
          )}

          <TextAreaField
            name="description"
            label="Description (optional)"
            rows={5}
            defaultValue={resource?.description ?? ""}
            hint={MARKDOWN_HINT}
            errors={errors}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              name="chapterId"
              label="Chapter (optional)"
              hint="Also shown on that chapter's page."
              errors={errors}
            >
              {(props) => (
                <select {...props} defaultValue={resource?.chapterId ?? ""} className={inputClass}>
                  <option value="">None — standalone resource</option>
                  {chapterGroups.map((group) => (
                    <optgroup key={group.courseId} label={group.courseTitle}>
                      {group.chapters.map((chapter) => (
                        <option key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </Field>
            <Field
              name="category"
              label="Category (optional)"
              hint="Empty: a chapter resource uses its course's category."
              errors={errors}
            >
              {(props) => (
                <select {...props} defaultValue={resource?.category ?? ""} className={inputClass}>
                  <option value="">None</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          <CheckboxField
            name="isPublished"
            label="Published"
            hint="Visible on /resources (and on its chapter page if that chapter is public)."
            defaultChecked={resource?.isPublished}
          />
        </>
      )}
    </ActionForm>
  );
}
