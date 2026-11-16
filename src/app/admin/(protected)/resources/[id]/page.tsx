import type { Metadata } from "next";
import { Suspense } from "react";
import { deleteResource, updateResource } from "@/actions/resources";
import { BackLink } from "@/components/admin/back-link";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { MissingNotice } from "@/components/admin/missing-notice";
import { ResourceForm } from "@/components/admin/resource-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { cardClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth";
import { getChapterGroups } from "@/lib/data/admin";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit resource" };

export default function EditResourcePage({ params }: PageProps<"/admin/resources/[id]">) {
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/resources">All resources</BackLink>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <ResourceEditor params={params} />
      </Suspense>
    </div>
  );
}

async function ResourceEditor({ params }: Pick<PageProps<"/admin/resources/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;

  const [resource, chapterGroups] = await Promise.all([
    db.resource.findUnique({ where: { id } }),
    getChapterGroups(),
  ]);
  if (!resource) return <MissingNotice what="resource" backHref="/admin/resources" />;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{resource.title}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            {resource.type} <StatusBadge published={resource.isPublished} />
          </p>
        </div>
        <ConfirmDeleteButton
          variant="button"
          action={deleteResource.bind(null, resource.id)}
          itemLabel={`resource "${resource.title}"`}
          redirectTo="/admin/resources"
          warning={
            resource.cloudinaryPublicId ? (
              <p>The uploaded file is deleted from Cloudinary too.</p>
            ) : undefined
          }
        />
      </div>
      <div className={`${cardClass} p-5 sm:p-6`}>
        <ResourceForm
          key={resource.updatedAt.toISOString()}
          action={updateResource.bind(null, resource.id)}
          chapterGroups={chapterGroups}
          resource={{
            title: resource.title,
            description: resource.description,
            type: resource.type,
            url: resource.url,
            file: resource.cloudinaryPublicId
              ? { url: resource.url, publicId: resource.cloudinaryPublicId }
              : null,
            category: resource.category,
            chapterId: resource.chapterId,
            isPublished: resource.isPublished,
          }}
        />
      </div>
    </>
  );
}
