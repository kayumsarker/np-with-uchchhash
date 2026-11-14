"use client";

import type { Category } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/action-state";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { ActionForm } from "./action-form";
import { CheckboxField, Field, MARKDOWN_HINT, TextAreaField } from "./fields";
import { SlugFields } from "./slug-fields";
import { inputClass } from "./styles";

export type CourseFormValues = {
  title: string;
  slug: string;
  description: string;
  category: Category;
  isPublished: boolean;
  isFeatured: boolean;
};

type Props = {
  action: (formData: FormData) => Promise<ActionState>;
  /** Omit for a new course. */
  course?: CourseFormValues;
};

export function CourseForm({ action, course }: Props) {
  const isNew = !course;

  return (
    <ActionForm
      action={action}
      submitLabel={isNew ? "Create course" : "Save changes"}
      pendingLabel={isNew ? "Creating…" : "Saving…"}
    >
      {(errors) => (
        <>
          <SlugFields
            defaultTitle={course?.title}
            defaultSlug={course?.slug}
            autoSlug={isNew}
            isPublished={course?.isPublished}
            urlPrefix="/courses/"
            errors={errors}
          />
          <Field name="category" label="Category" errors={errors}>
            {(props) => (
              <select {...props} defaultValue={course?.category ?? ""} className={inputClass}>
                <option value="" disabled>
                  Choose a category…
                </option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <TextAreaField
            name="description"
            label="Description"
            required
            rows={10}
            defaultValue={course?.description}
            hint={MARKDOWN_HINT}
            errors={errors}
          />
          <fieldset className="space-y-3">
            <legend className="sr-only">Visibility</legend>
            <CheckboxField
              name="isPublished"
              label="Published"
              hint="Visible to students. Drafts are hidden from the public site."
              defaultChecked={course?.isPublished}
            />
            <CheckboxField
              name="isFeatured"
              label="Featured"
              hint="Shown on the home page (only when also published)."
              defaultChecked={course?.isFeatured}
            />
          </fieldset>
        </>
      )}
    </ActionForm>
  );
}
