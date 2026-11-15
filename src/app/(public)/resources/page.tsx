import type { Metadata } from "next";
import { Suspense } from "react";
import { ResourceBrowser, ResourceBrowserFromUrl } from "@/components/public/resource-browser";
import { getPublishedResources } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Resources",
  description: "Free physics notes, PDFs and links for SSC, HSC and advanced learners.",
};

export default async function ResourcesPage() {
  const resources = await getPublishedResources();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-bold">Resources</h1>
      <p className="mt-3 mb-10 max-w-2xl text-muted">
        Notes, worksheets and hand-picked links to go with the lessons.
      </p>
      {/* Static shell shows everything; ?type= / ?category= are applied in the browser. */}
      <Suspense fallback={<ResourceBrowser resources={resources} />}>
        <ResourceBrowserFromUrl resources={resources} />
      </Suspense>
    </div>
  );
}
