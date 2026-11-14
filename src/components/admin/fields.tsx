import type { ComponentProps, ReactNode } from "react";
import { inputClass } from "./styles";

export type FieldErrors = Record<string, string[] | undefined>;

type FieldProps = {
  name: string;
  label: string;
  hint?: ReactNode;
  errors?: FieldErrors;
  children: (props: {
    id: string;
    name: string;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
  }) => ReactNode;
};

/** Label + control + hint + error message, wired up for screen readers. */
export function Field({ name, label, hint, errors, children }: FieldProps) {
  const id = `field-${name}`;
  const error = errors?.[name]?.[0];
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children({
        id,
        name,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = Omit<ComponentProps<"input">, "name" | "id"> & {
  name: string;
  label: string;
  hint?: ReactNode;
  errors?: FieldErrors;
};

export function TextField({ name, label, hint, errors, className, ...rest }: TextFieldProps) {
  return (
    <Field name={name} label={label} hint={hint} errors={errors}>
      {(props) => <input {...rest} {...props} className={`${inputClass} ${className ?? ""}`} />}
    </Field>
  );
}

type TextAreaFieldProps = Omit<ComponentProps<"textarea">, "name" | "id"> & {
  name: string;
  label: string;
  hint?: ReactNode;
  errors?: FieldErrors;
};

export function TextAreaField({ name, label, hint, errors, ...rest }: TextAreaFieldProps) {
  return (
    <Field name={name} label={label} hint={hint} errors={errors}>
      {(props) => (
        <textarea rows={8} {...rest} {...props} className={`${inputClass} font-mono text-sm`} />
      )}
    </Field>
  );
}

type CheckboxFieldProps = {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
};

export function CheckboxField({ name, label, hint, defaultChecked }: CheckboxFieldProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 size-4 accent-primary"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export const MARKDOWN_HINT = (
  <>
    Markdown supported: <code>**bold**</code>, <code>*italic*</code>, <code>- list</code>,{" "}
    <code>[link](https://…)</code>, <code>`F = ma`</code>.
  </>
);
