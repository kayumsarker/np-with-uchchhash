import type { Metadata } from "next";
import { Suspense } from "react";
import { deleteChapter, updateChapter } from "@/actions/chapters";
import { BackLink } from "@/components/admin/back-link";
import { ChapterForm } from "@/components/admin/chapter-form";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { MissingNotice } from "@/components/admin/missing-notice";
import { StatusBadge } from "@/components/admin/status-badge";
import { cardClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit chapter" };

type Props = PageProps<"/admin/courses/[id]/chapters/[chapterId]">;

export default function EditChapterPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <ChapterEditor params={params} />
      </Suspense>
    </div>
  );
}

async function ChapterEditor({ params }: Pick<Props, "params">) {
  await requireAdmin();
  const { id, chapterId } = await params;

  const chapter = await db.chapter.findFirst({
    where: { id: chapterId, courseId: id },
    include: { course: { select: { id: true, title: true, slug: true } } },
  });
  if (!chapter) return <MissingNotice what="chapter" backHref={`/admin/courses/${id}`} />;

  return (
    <>
      <BackLink href={`/admin/courses/${chapter.course.id}`}>{chapter.course.title}</BackLink>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{chapter.title}</h1>
          <p className="mt-1">
            <StatusBadge published={chapter.isPublished} />
          </p>
        </div>
        <ConfirmDeleteButton
          variant="button"
          action={deleteChapter.bind(null, chapter.id)}
          redirectTo={`/admin/courses/${chapter.course.id}`}
          itemLabel={`chapter "${chapter.title}"`}
          warning={<p>Resources attached to it are kept as standalone resources.</p>}
        />
      </div>
      <div className={`${cardClass} p-5 sm:p-6`}>
        <ChapterForm
          key={chapter.updatedAt.toISOString()}
          action={updateChapter.bind(null, chapter.id)}
          courseSlug={chapter.course.slug}
          chapter={{
            title: chapter.title,
            slug: chapter.slug,
            description: chapter.description,
            youtubeUrl: chapter.youtubeUrl,
            isPublished: chapter.isPublished,
          }}
        />
      </div>
    </>
  );
}
