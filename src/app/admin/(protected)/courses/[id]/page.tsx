import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { deleteChapter, moveChapter, toggleChapterPublished } from "@/actions/chapters";
import { deleteCourse, updateCourse } from "@/actions/courses";
import { ActionButton } from "@/components/admin/action-button";
import { BackLink } from "@/components/admin/back-link";
import { ChapterWarning } from "@/components/admin/chapter-warning";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { CourseForm } from "@/components/admin/course-form";
import { MissingNotice } from "@/components/admin/missing-notice";
import { StatusBadge } from "@/components/admin/status-badge";
import { btn, cardClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth";
import { CATEGORY_LABELS } from "@/lib/categories";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit course" };

export default function EditCoursePage({ params }: PageProps<"/admin/courses/[id]">) {
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/courses">All courses</BackLink>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <CourseEditor params={params} />
      </Suspense>
    </div>
  );
}

async function CourseEditor({ params }: Pick<PageProps<"/admin/courses/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;

  const course = await db.course.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: { id: true, title: true, slug: true, isPublished: true, youtubeId: true },
      },
    },
  });
  if (!course) return <MissingNotice what="course" backHref="/admin/courses" />;

  const chapters = course.chapters;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            {CATEGORY_LABELS[course.category]} <StatusBadge published={course.isPublished} />
          </p>
        </div>
        <ConfirmDeleteButton
          variant="button"
          action={deleteCourse.bind(null, course.id)}
          itemLabel={`course "${course.title}"`}
          warning={<ChapterWarning count={chapters.length} />}
        />
      </div>

      <section aria-labelledby="details-heading" className={`${cardClass} p-5 sm:p-6`}>
        <h2 id="details-heading" className="mb-4 text-xl font-bold">
          Details
        </h2>
        <CourseForm
          key={course.updatedAt.toISOString()}
          action={updateCourse.bind(null, course.id)}
          course={{
            title: course.title,
            slug: course.slug,
            description: course.description,
            category: course.category,
            isPublished: course.isPublished,
            isFeatured: course.isFeatured,
          }}
        />
      </section>

      <section aria-labelledby="chapters-heading" className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
          <h2 id="chapters-heading" className="text-xl font-bold">
            Chapters <span className="text-sm font-normal text-muted">({chapters.length})</span>
          </h2>
          <Link
            href={`/admin/courses/${course.id}/chapters/new`}
            className={`${btn.base} ${btn.primary}`}
          >
            <Plus className="size-4" aria-hidden />
            Add chapter
          </Link>
        </div>

        {chapters.length === 0 ? (
          <p className={`${cardClass} p-4 text-sm text-muted`}>No chapters yet.</p>
        ) : (
          <ol className={`${cardClass} divide-y divide-border`}>
            {chapters.map((chapter, index) => (
              <li key={chapter.id} className="flex flex-wrap items-center gap-3 p-4">
                <span className="w-6 text-right font-mono text-sm text-muted">{index + 1}.</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/courses/${course.id}/chapters/${chapter.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {chapter.title}
                    </Link>
                    <StatusBadge published={chapter.isPublished} />
                  </div>
                  <p className="mt-0.5 truncate font-mono text-xs text-muted">
                    /{chapter.slug} · ▶ {chapter.youtubeId}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ActionButton
                    action={moveChapter.bind(null, chapter.id, "up")}
                    label={`Move ${chapter.title} up`}
                    className={btn.icon}
                    disabled={index === 0}
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </ActionButton>
                  <ActionButton
                    action={moveChapter.bind(null, chapter.id, "down")}
                    label={`Move ${chapter.title} down`}
                    className={btn.icon}
                    disabled={index === chapters.length - 1}
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </ActionButton>
                  <ActionButton
                    action={toggleChapterPublished.bind(null, chapter.id)}
                    label={chapter.isPublished ? "Unpublish" : "Publish"}
                    className={`${btn.base} ${btn.secondary} px-3 py-1.5`}
                  >
                    {chapter.isPublished ? "Unpublish" : "Publish"}
                  </ActionButton>
                  <Link
                    href={`/admin/courses/${course.id}/chapters/${chapter.id}`}
                    aria-label={`Edit ${chapter.title}`}
                    title="Edit"
                    className={btn.icon}
                  >
                    <Pencil className="size-4" aria-hidden />
                  </Link>
                  <ConfirmDeleteButton
                    action={deleteChapter.bind(null, chapter.id)}
                    itemLabel={`chapter "${chapter.title}"`}
                    warning={<p>Resources attached to it are kept as standalone resources.</p>}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
