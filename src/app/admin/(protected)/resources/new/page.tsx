import type { Metadata } from "next";
import { Suspense } from "react";
import { createResource } from "@/actions/resources";
import { BackLink } from "@/components/admin/back-link";
import { ResourceForm } from "@/components/admin/resource-form";
import { cardClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth";
import { getChapterGroups } from "@/lib/data/admin";

export const metadata: Metadata = { title: "New resource" };

export default function NewResourcePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/resources">All resources</BackLink>
      <h1 className="mb-6 text-3xl font-bold">New resource</h1>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <NewResourceForm />
      </Suspense>
    </div>
  );
}

async function NewResourceForm() {
  await requireAdmin();
  const chapterGroups = await getChapterGroups();
  return (
    <div className={`${cardClass} p-5 sm:p-6`}>
      <ResourceForm action={createResource} chapterGroups={chapterGroups} />
    </div>
  );
}
