import { useState } from "react";
import type { Application, Status } from "../types";
import { PLATFORM_SHORT, STATUSES } from "../constants";
import { StatusBadge } from "./StatusBadge";
import { formatDate, relativeFromNow } from "../utils/format";

interface Props {
  app: Application;
  expanded: boolean;
  hasCv: boolean;
  docCount: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenDocs: () => void;
  onQuickStatus: (status: Status) => void;
}

export function ApplicationRow({
  app,
  expanded,
  hasCv,
  docCount,
  onToggle,
  onEdit,
  onDelete,
  onOpenDocs,
  onQuickStatus,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="group border-b border-line transition-colors last:border-b-0">
      {/* Header — status is a live quick-change control; the rest toggles the row */}
      <div className="flex w-full items-center gap-4">
        <div className="w-28 shrink-0 py-5 sm:w-32">
          <div className="relative inline-flex items-center gap-1">
            <StatusBadge status={app.status} />
            <svg
              className="h-3 w-3 text-faint"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <select
              value={app.status}
              onChange={(e) => onQuickStatus(e.target.value as Status)}
              aria-label={`Change status for ${app.company}`}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
              style={{ colorScheme: "dark" }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-4 py-5 text-left transition-colors hover:bg-surface/40"
        >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[15px] font-medium text-ink">
              {app.company}
            </span>
            {!hasCv ? (
              <span className="shrink-0 rounded-full border border-[#C9A24B]/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#C9A24B]">
                No CV
              </span>
            ) : null}
          </span>
          <span className="block truncate text-sm text-muted">{app.role}</span>
        </span>

        <span className="hidden shrink-0 text-right sm:block">
          <span className="block font-mono text-[11px] uppercase tracking-wider text-muted">
            {app.city || "—"}
          </span>
          <span className="block font-mono text-[10px] text-faint">
            {PLATFORM_SHORT[app.platform]}
          </span>
        </span>

        <span className="hidden w-28 shrink-0 text-right md:block">
          <span className="block font-mono text-[11px] text-muted">
            {formatDate(app.dateApplied)}
          </span>
          <span className="block font-mono text-[10px] text-faint">
            {relativeFromNow(app.dateApplied)}
          </span>
        </span>

        <svg
          className={`h-4 w-4 shrink-0 text-faint transition-transform duration-200 ease-weighty ${
            expanded ? "rotate-180 text-accent-ink" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        </button>
      </div>

      {/* Accordion body */}
      <div className="accordion" data-open={expanded}>
        <div className="accordion-inner">
          <div className="pb-6 pl-0 sm:pl-32">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <Field label="Platform" value={app.platform} />
              <Field label="City" value={app.city || "—"} />
              <Field label="Salary" value={app.salary || "—"} />
              <Field label="Applied" value={formatDate(app.dateApplied)} />
            </dl>

            {app.notes ? (
              <p className="mt-5 max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-ink/85">
                {app.notes}
              </p>
            ) : (
              <p className="mt-5 font-serif text-base italic text-faint">No notes yet.</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              {app.jobUrl ? (
                <a
                  href={app.jobUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-accent-ink transition-colors hover:text-accent"
                >
                  View listing
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M7 17 17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ) : null}

              {app.cvUrl ? (
                <a
                  href={app.cvUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-accent-ink transition-colors hover:text-accent"
                >
                  Open CV
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M7 17 17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
              <span className="font-mono text-[10px] text-faint">
                Updated {relativeFromNow(app.updatedAt.slice(0, 10))}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenDocs}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink transition-colors hover:border-accent/40 hover:text-accent-ink"
                >
                  Documents
                  {docCount > 0 ? (
                    <span className="text-accent-ink">{docCount}</span>
                  ) : null}
                </button>

                {confirming ? (
                  <>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      Delete?
                    </span>
                    <button
                      onClick={onDelete}
                      className="rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#B5604F] transition-colors hover:text-[#d2705c]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirming(false)}
                      className="rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-ink"
                    >
                      No
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setConfirming(true)}
                      className="rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-faint transition-colors hover:text-[#B5604F]"
                    >
                      Delete
                    </button>
                    <button
                      onClick={onEdit}
                      className="rounded-full border border-line px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink transition-colors hover:border-accent/40 hover:text-accent-ink"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
        {label}
      </dt>
      <dd className="truncate text-sm text-ink/90">{value}</dd>
    </div>
  );
}
