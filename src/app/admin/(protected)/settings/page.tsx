import type { Metadata } from "next";
import { Suspense } from "react";
import { updateSettings } from "@/actions/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import { cardClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold">Site settings</h1>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <SettingsEditor />
      </Suspense>
    </div>
  );
}

async function SettingsEditor() {
  await requireAdmin();
  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });

  return (
    <div className={`${cardClass} p-5 sm:p-6`}>
      <SettingsForm
        key={settings?.updatedAt.toISOString() ?? "new"}
        action={updateSettings}
        settings={settings}
      />
    </div>
  );
}
