"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { ActionState } from "@/lib/action-state";
import type { FieldErrors } from "./fields";
import { btn } from "./styles";
import { useActionRunner } from "./use-action-runner";

type Props = {
  action: (formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  pendingLabel: string;
  children: (errors: FieldErrors) => ReactNode;
};

/**
 * Submits via onSubmit (not `<form action>`), so React does not reset the
 * fields when validation fails — the admin never loses what they typed.
 */
export function ActionForm({ action, submitLabel, pendingLabel, children }: Props) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const { run, pending } = useActionRunner();

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        // UploadField marks itself busy while a file is still uploading.
        if (event.currentTarget.querySelector('[data-uploading="true"]')) {
          toast.error("Wait for the upload to finish.");
          return;
        }
        const formData = new FormData(event.currentTarget);
        run(
          () => action(formData),
          (result) => setErrors(result.status === "error" ? (result.fieldErrors ?? {}) : {}),
        );
      }}
    >
      {children(errors)}
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={`${btn.base} ${btn.primary}`}>
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
