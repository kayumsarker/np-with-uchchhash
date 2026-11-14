import type { Metadata } from "next";
import { Suspense } from "react";
import { createChapter } from "@/actions/chapters";
import { BackLink } from "@/components/admin/back-link";
import { ChapterForm } from "@/components/admin/chapter-form";
import { MissingNotice } from "@/components/admin/missing-notice";
import { cardClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "New chapter" };

export default function NewChapterPage({ params }: PageProps<"/admin/courses/[id]/chapters/new">) {
  return (
    <div className="mx-auto max-w-3xl">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <NewChapter params={params} />
      </Suspense>
    </div>
  );
}

async function NewChapter({
  params,
}: Pick<PageProps<"/admin/courses/[id]/chapters/new">, "params">) {
  await requireAdmin();
  const { id } = await params;

  const course = await db.course.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true },
  });
  if (!course) return <MissingNotice what="course" backHref="/admin/courses" />;

  return (
    <>
      <BackLink href={`/admin/courses/${course.id}`}>{course.title}</BackLink>
      <h1 className="mb-6 text-3xl font-bold">New chapter</h1>
      <div className={`${cardClass} p-5 sm:p-6`}>
        <ChapterForm action={createChapter.bind(null, course.id)} courseSlug={course.slug} />
      </div>
    </>
  );
}
