import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  FileText,
  ImageIcon,
  Link2,
  Pencil,
  Plus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { deleteResource, moveResource, toggleResourcePublished } from "@/actions/resources";
import { ActionButton } from "@/components/admin/action-button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { StatusBadge } from "@/components/admin/status-badge";
import { btn, cardClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth";
import { CATEGORY_LABELS } from "@/lib/categories";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Resources" };

const ICONS = { PDF: FileText, IMAGE: ImageIcon, LINK: Link2 } as const;

export default function AdminResourcesPage() {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Resources</h1>
        <Link href="/admin/resources/new" className={`${btn.base} ${btn.primary}`}>
          <Plus className="size-4" aria-hidden />
          New resource
        </Link>
      </div>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <ResourceList />
      </Suspense>
    </>
  );
}

async function ResourceList() {
  await requireAdmin();

  const resources = await db.resource.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      type: true,
      url: true,
      category: true,
      isPublished: true,
      cloudinaryPublicId: true,
      chapter: { select: { title: true, course: { select: { title: true } } } },
    },
  });

  if (resources.length === 0) {
    return <p className={`${cardClass} p-4 text-sm text-muted`}>No resources yet.</p>;
  }

  return (
    <>
      <p className="mb-3 text-sm text-muted">
        The order here is the order on /resources and on chapter pages.
      </p>
      <ol className={`${cardClass} divide-y divide-border`}>
        {resources.map((resource, index) => {
          const Icon = ICONS[resource.type];
          return (
            <li key={resource.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                <Icon className="size-4" aria-label={resource.type} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/resources/${resource.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {resource.title}
                  </Link>
                  <StatusBadge published={resource.isPublished} />
                  {resource.category && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                      {CATEGORY_LABELS[resource.category]}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                  {resource.chapter
                    ? `${resource.chapter.course.title} › ${resource.chapter.title}`
                    : "Standalone"}
                  {" · "}
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    Open <ExternalLink className="size-3" aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ActionButton
                  action={moveResource.bind(null, resource.id, "up")}
                  label={`Move ${resource.title} up`}
                  className={btn.icon}
                  disabled={index === 0}
                >
                  <ArrowUp className="size-4" aria-hidden />
                </ActionButton>
                <ActionButton
                  action={moveResource.bind(null, resource.id, "down")}
                  label={`Move ${resource.title} down`}
                  className={btn.icon}
                  disabled={index === resources.length - 1}
                >
                  <ArrowDown className="size-4" aria-hidden />
                </ActionButton>
                <ActionButton
                  action={toggleResourcePublished.bind(null, resource.id)}
                  label={resource.isPublished ? "Unpublish" : "Publish"}
                  className={`${btn.base} ${btn.secondary} px-3 py-1.5`}
                >
                  {resource.isPublished ? "Unpublish" : "Publish"}
                </ActionButton>
                <Link
                  href={`/admin/resources/${resource.id}`}
                  aria-label={`Edit ${resource.title}`}
                  title="Edit"
                  className={btn.icon}
                >
                  <Pencil className="size-4" aria-hidden />
                </Link>
                <ConfirmDeleteButton
                  action={deleteResource.bind(null, resource.id)}
                  itemLabel={`resource "${resource.title}"`}
                  warning={
                    resource.cloudinaryPublicId ? (
                      <p>The uploaded file is deleted from Cloudinary too.</p>
                    ) : undefined
                  }
                />
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
