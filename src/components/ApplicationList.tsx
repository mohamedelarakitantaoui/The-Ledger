import { useState } from "react";
import type { Application } from "../types";
import { ApplicationRow } from "./ApplicationRow";

interface Props {
  applications: Application[];
  cvAppIds: Set<string>;
  docCountByApp: Record<string, number>;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  onOpenDocs: (app: Application) => void;
}

/** The ledger itself — accordion rows, sorted by the parent (dateApplied desc). */
export function ApplicationList({
  applications,
  cvAppIds,
  docCountByApp,
  onEdit,
  onDelete,
  onOpenDocs,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col">
      <div className="hidden items-center gap-4 border-b border-line pb-3 sm:flex">
        <span className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-faint sm:w-32">
          Status
        </span>
        <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          Company · Role
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          Where
        </span>
        <span className="hidden w-28 shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-faint md:block">
          Applied
        </span>
        <span className="w-4 shrink-0" />
      </div>

      {applications.map((app) => (
        <ApplicationRow
          key={app.id}
          app={app}
          expanded={expandedId === app.id}
          hasCv={cvAppIds.has(app.id)}
          docCount={docCountByApp[app.id] ?? 0}
          onToggle={() =>
            setExpandedId((cur) => (cur === app.id ? null : app.id))
          }
          onEdit={() => onEdit(app)}
          onDelete={() => onDelete(app.id)}
          onOpenDocs={() => onOpenDocs(app)}
        />
      ))}
    </div>
  );
}
