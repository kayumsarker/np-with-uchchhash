"use client";

import { useState } from "react";
import { slugify } from "@/lib/slug";
import { TextField, type FieldErrors } from "./fields";

type Props = {
  defaultTitle?: string;
  defaultSlug?: string;
  /** New records: slug follows the title until the admin edits it. */
  autoSlug: boolean;
  /** Published records: warn that a slug change breaks existing links. */
  isPublished?: boolean;
  urlPrefix: string;
  errors?: FieldErrors;
};

export function SlugFields({
  defaultTitle = "",
  defaultSlug = "",
  autoSlug,
  isPublished,
  urlPrefix,
  errors,
}: Props) {
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState(defaultSlug);
  const [slugEdited, setSlugEdited] = useState(!autoSlug);

  const slugChanged = defaultSlug !== "" && slug !== defaultSlug;

  return (
    <>
      <TextField
        name="title"
        label="Title"
        required
        maxLength={120}
        value={title}
        errors={errors}
        onChange={(e) => {
          setTitle(e.target.value);
          if (!slugEdited) setSlug(slugify(e.target.value));
        }}
      />
      <TextField
        name="slug"
        label="Slug"
        required
        maxLength={80}
        value={slug}
        errors={errors}
        className="font-mono text-sm"
        autoCapitalize="none"
        spellCheck={false}
        onChange={(e) => {
          setSlugEdited(true);
          setSlug(e.target.value.toLowerCase());
        }}
        hint={
          <>
            URL:{" "}
            <span className="font-mono">
              {urlPrefix}
              {slug || "…"}
            </span>
            {slugChanged && isPublished && (
              <span className="mt-1 block text-accent">
                Changing the slug of a published page breaks existing links to it.
              </span>
            )}
            {autoSlug && slugEdited && (
              <button
                type="button"
                className="ml-2 text-primary underline"
                onClick={() => {
                  setSlugEdited(false);
                  setSlug(slugify(title));
                }}
              >
                Reset from title
              </button>
            )}
          </>
        }
      />
    </>
  );
}
