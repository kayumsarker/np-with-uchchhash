import { ArrowDown, ArrowUp, Pencil, Plus, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { deleteCourse, moveCourse, toggleCourse } from "@/actions/courses";
import { ActionButton } from "@/components/admin/action-button";
import { ChapterWarning } from "@/components/admin/chapter-warning";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { FeaturedBadge, StatusBadge } from "@/components/admin/status-badge";
import { btn, cardClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Courses" };

export default function AdminCoursesPage() {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Link href="/admin/courses/new" className={`${btn.base} ${btn.primary}`}>
          <Plus className="size-4" aria-hidden />
          New course
        </Link>
      </div>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <CourseList />
      </Suspense>
    </>
  );
}

async function CourseList() {
  await requireAdmin();

  const courses = await db.course.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      isPublished: true,
      isFeatured: true,
      _count: { select: { chapters: true } },
    },
  });

  return (
    <div className="space-y-8">
      {CATEGORIES.map((category) => {
        const list = courses.filter((course) => course.category === category);
        return (
          <section key={category} aria-labelledby={`cat-${category}`}>
            <h2 id={`cat-${category}`} className="mb-3 text-xl font-bold">
              {CATEGORY_LABELS[category]}{" "}
              <span className="text-sm font-normal text-muted">({list.length})</span>
            </h2>
            {list.length === 0 ? (
              <p className={`${cardClass} p-4 text-sm text-muted`}>No courses yet.</p>
            ) : (
              <ul className={`${cardClass} divide-y divide-border`}>
                {list.map((course, index) => (
                  <li key={course.id} className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {course.title}
                        </Link>
                        <StatusBadge published={course.isPublished} />
                        {course.isFeatured && <FeaturedBadge />}
                      </div>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted">
                        /{course.slug} · {course._count.chapters} chapter
                        {course._count.chapters === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ActionButton
                        action={moveCourse.bind(null, course.id, "up")}
                        label={`Move ${course.title} up`}
                        className={btn.icon}
                        disabled={index === 0}
                      >
                        <ArrowUp className="size-4" aria-hidden />
                      </ActionButton>
                      <ActionButton
                        action={moveCourse.bind(null, course.id, "down")}
                        label={`Move ${course.title} down`}
                        className={btn.icon}
                        disabled={index === list.length - 1}
                      >
                        <ArrowDown className="size-4" aria-hidden />
                      </ActionButton>
                      <ActionButton
                        action={toggleCourse.bind(null, course.id, "isFeatured")}
                        label={course.isFeatured ? "Remove from featured" : "Feature on home page"}
                        className={`${btn.icon} ${course.isFeatured ? "text-accent" : ""}`}
                      >
                        <Star
                          className="size-4"
                          fill={course.isFeatured ? "currentColor" : "none"}
                          aria-hidden
                        />
                      </ActionButton>
                      <ActionButton
                        action={toggleCourse.bind(null, course.id, "isPublished")}
                        label={course.isPublished ? "Unpublish" : "Publish"}
                        className={`${btn.base} ${btn.secondary} px-3 py-1.5`}
                      >
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </ActionButton>
                      <Link
                        href={`/admin/courses/${course.id}`}
                        aria-label={`Edit ${course.title}`}
                        title="Edit"
                        className={btn.icon}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                      <ConfirmDeleteButton
                        action={deleteCourse.bind(null, course.id)}
                        itemLabel={`course "${course.title}"`}
                        warning={<ChapterWarning count={course._count.chapters} />}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
