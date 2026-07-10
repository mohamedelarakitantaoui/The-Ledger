import { useEffect, useId, useRef, useState } from "react";
import type {
  Application,
  ApplicationInput,
  Platform,
  Pipeline,
  Status,
} from "../types";
import {
  DEFAULT_PIPELINE,
  PIPELINES,
  PLATFORMS,
  STATUSES,
} from "../constants";
import { todayISO } from "../utils/format";
import { fieldClass, Labeled, SelectField } from "./ui";

interface Props {
  /** The application being edited, or null when creating a new one. */
  editing: Application | null;
  /** Pipeline to default a brand-new application to. */
  defaultPipeline?: Pipeline;
  onClose: () => void;
  onSubmit: (input: ApplicationInput) => void;
}

function emptyForm(pipeline: Pipeline): ApplicationInput {
  return {
    company: "",
    role: "",
    platform: "LinkedIn",
    pipeline,
    status: "Applied",
    city: "",
    salary: "",
    jobUrl: "",
    cvUrl: "",
    dateApplied: todayISO(),
    notes: "",
  };
}

export function ApplicationModal({
  editing,
  defaultPipeline = DEFAULT_PIPELINE,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<ApplicationInput>(() =>
    editing
      ? {
          company: editing.company,
          role: editing.role,
          platform: editing.platform,
          pipeline: editing.pipeline,
          status: editing.status,
          city: editing.city,
          salary: editing.salary ?? "",
          jobUrl: editing.jobUrl ?? "",
          cvUrl: editing.cvUrl ?? "",
          dateApplied: editing.dateApplied,
          notes: editing.notes,
        }
      : emptyForm(defaultPipeline),
  );
  const [showErrors, setShowErrors] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const companyMissing = form.company.trim() === "";
  const roleMissing = form.role.trim() === "";

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  function set<K extends keyof ApplicationInput>(
    key: K,
    value: ApplicationInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (companyMissing || roleMissing) {
      setShowErrors(true);
      return;
    }
    onSubmit({
      ...form,
      company: form.company.trim(),
      role: form.role.trim(),
      city: form.city.trim(),
      salary: form.salary?.trim() || "",
      jobUrl: form.jobUrl?.trim() || "",
      cvUrl: form.cvUrl?.trim() || "",
    });
  }

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-panel relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">
              {editing ? "Edit entry" : "New entry"}
            </span>
            <h2 id={titleId} className="font-serif text-2xl font-light text-ink">
              {editing ? editing.company || "Application" : "Log an application"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-elevated hover:text-ink"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-x-4 gap-y-5 overflow-y-auto px-6 py-6">
            <Labeled className="col-span-2" label="Company" required error={showErrors && companyMissing ? "Company is required" : undefined}>
              <input
                ref={firstFieldRef}
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="e.g. ONCF Digital"
                className={fieldClass}
              />
            </Labeled>

            <Labeled className="col-span-2" label="Role" required error={showErrors && roleMissing ? "Role is required" : undefined}>
              <input
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="e.g. Junior Backend Developer"
                className={fieldClass}
              />
            </Labeled>

            <Labeled label="Pipeline" className="col-span-2 sm:col-span-1">
              <SelectField
                value={form.pipeline}
                onChange={(v) => set("pipeline", v as Pipeline)}
                options={PIPELINES}
              />
            </Labeled>

            <Labeled label="Status" className="col-span-2 sm:col-span-1">
              <SelectField
                value={form.status}
                onChange={(v) => set("status", v as Status)}
                options={STATUSES}
              />
            </Labeled>

            <Labeled label="Platform" className="col-span-2 sm:col-span-1">
              <SelectField
                value={form.platform}
                onChange={(v) => set("platform", v as Platform)}
                options={PLATFORMS}
              />
            </Labeled>

            <Labeled label="City" className="col-span-2 sm:col-span-1">
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Casablanca, Remote…"
                className={fieldClass}
              />
            </Labeled>

            <Labeled label="Date applied" className="col-span-2 sm:col-span-1">
              <input
                type="date"
                value={form.dateApplied}
                onChange={(e) => set("dateApplied", e.target.value)}
                style={{ colorScheme: "dark" }}
                className={fieldClass}
              />
            </Labeled>

            <Labeled label="Salary" className="col-span-2 sm:col-span-1" hint="optional">
              <input
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
                placeholder="e.g. 10 000 MAD"
                className={fieldClass}
              />
            </Labeled>

            <Labeled label="Job URL" className="col-span-2" hint="optional">
              <input
                type="url"
                value={form.jobUrl}
                onChange={(e) => set("jobUrl", e.target.value)}
                placeholder="https://…"
                className={fieldClass}
              />
            </Labeled>

            <Labeled label="CV link" className="col-span-2" hint="optional — Drive/Dropbox URL of the CV you used">
              <input
                type="url"
                value={form.cvUrl}
                onChange={(e) => set("cvUrl", e.target.value)}
                placeholder="https://drive.google.com/…"
                className={fieldClass}
              />
            </Labeled>

            <Labeled label="Notes" className="col-span-2">
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={4}
                placeholder="Recruiter name, next steps, how it went…"
                className={`${fieldClass} h-auto resize-y py-3 leading-relaxed`}
              />
            </Labeled>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2.5 text-sm text-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-canvas transition-all duration-200 ease-weighty hover:brightness-110 active:scale-[0.98]"
            >
              {editing ? "Save changes" : "Add application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
