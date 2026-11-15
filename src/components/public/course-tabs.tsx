"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useState, type KeyboardEvent } from "react";
import type { Category } from "@/generated/prisma/enums";
import { CATEGORIES } from "@/lib/categories";
import type { CourseCard as CourseCardData } from "@/lib/data/public";
import { CourseCard } from "./course-card";
import { replaceSearchParam } from "./url-param";

export type CourseGroup = { category: Category; label: string; courses: CourseCardData[] };

function parseCategory(value: string | null): Category | null {
  const upper = value?.toUpperCase();
  return CATEGORIES.find((c) => c === upper) ?? null;
}

/** Reads ?category= (needs a Suspense boundary); falls back to the first tab. */
export function CourseTabsFromUrl({ groups }: { groups: CourseGroup[] }) {
  const initial = parseCategory(useSearchParams().get("category"));
  return <CourseTabs groups={groups} initial={initial ?? groups[0].category} />;
}

export function CourseTabs({ groups, initial }: { groups: CourseGroup[]; initial: Category }) {
  const [active, setActive] = useState<Category>(initial);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(index: number) {
    const category = groups[index].category;
    setActive(category);
    tabRefs.current[index]?.focus();
    replaceSearchParam("category", category.toLowerCase());
  }

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = groups.length - 1;
    const target =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (target === null) return;
    event.preventDefault();
    select(target);
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Course categories"
        className="mb-8 inline-flex rounded-xl border border-border bg-surface p-1"
      >
        {groups.map((group, index) => {
          const selected = group.category === active;
          return (
            <button
              key={group.category}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              type="button"
              id={`tab-${group.category}`}
              aria-selected={selected}
              aria-controls={`panel-${group.category}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition sm:px-6 ${
                selected ? "bg-primary text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {group.label}
              <span className="ml-1.5 text-xs opacity-70">{group.courses.length}</span>
            </button>
          );
        })}
      </div>

      {groups.map((group) => (
        <div
          key={group.category}
          role="tabpanel"
          id={`panel-${group.category}`}
          aria-labelledby={`tab-${group.category}`}
          hidden={group.category !== active}
        >
          {group.courses.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
              {group.label} courses are coming soon.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.courses.map((course) => (
                <li key={course.id}>
                  <CourseCard course={course} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
