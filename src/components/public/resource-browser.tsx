"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Category, ResourceType } from "@/generated/prisma/enums";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import type { ResourceItem } from "@/lib/data/public";
import { RESOURCE_TYPE_LABELS, ResourceCard } from "./resource-card";
import { replaceSearchParam } from "./url-param";

const TYPES = ["PDF", "IMAGE", "LINK"] as const satisfies readonly ResourceType[];

function pick<T extends string>(options: readonly T[], value: string | null): T | null {
  const upper = value?.toUpperCase();
  return options.find((o) => o === upper) ?? null;
}

/** Reads ?type= and ?category= (needs a Suspense boundary). */
export function ResourceBrowserFromUrl({ resources }: { resources: ResourceItem[] }) {
  const params = useSearchParams();
  return (
    <ResourceBrowser
      resources={resources}
      initialType={pick(TYPES, params.get("type"))}
      initialCategory={pick(CATEGORIES, params.get("category"))}
    />
  );
}

type Props = {
  resources: ResourceItem[];
  initialType?: ResourceType | null;
  initialCategory?: Category | null;
};

export function ResourceBrowser({ resources, initialType = null, initialCategory = null }: Props) {
  const [type, setType] = useState<ResourceType | null>(initialType);
  const [category, setCategory] = useState<Category | null>(initialCategory);

  const filtered = resources.filter(
    (r) => (!type || r.type === type) && (!category || r.category === category),
  );

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-8">
        <FilterGroup
          label="Type"
          options={TYPES.map((t) => ({ value: t, label: RESOURCE_TYPE_LABELS[t] }))}
          value={type}
          onChange={(value) => {
            setType(value);
            replaceSearchParam("type", value?.toLowerCase() ?? null);
          }}
        />
        <FilterGroup
          label="Category"
          options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
          value={category}
          onChange={(value) => {
            setCategory(value);
            replaceSearchParam("category", value?.toLowerCase() ?? null);
          }}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "resource" : "resources"} shown
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
          No resources match these filters yet.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {filtered.map((resource) => (
            <li key={resource.id}>
              <ResourceCard resource={resource} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
}) {
  const all = [{ value: null, label: "All" }, ...options];
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {all.map((option) => {
          const pressed = option.value === value;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={pressed}
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                pressed
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted hover:border-primary/60 hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
