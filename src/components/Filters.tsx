import type { Pipeline, Status, StatusFilter } from "../types";
import { STATUSES, STATUS_META } from "../constants";
import { PipelineToggle } from "./PipelineToggle";
import { SearchBar } from "./SearchBar";

interface Props {
  pipeline: Pipeline;
  pipelineCounts: Record<Pipeline, number>;
  onPipelineChange: (pipeline: Pipeline) => void;

  status: StatusFilter;
  statusCounts: Record<Status, number>;
  total: number;
  onStatusChange: (status: StatusFilter) => void;

  query: string;
  onQueryChange: (query: string) => void;

  needsCvOnly: boolean;
  needsCvCount: number;
  onToggleNeedsCv: () => void;
}

export function Filters({
  pipeline,
  pipelineCounts,
  onPipelineChange,
  status,
  statusCounts,
  total,
  onStatusChange,
  query,
  onQueryChange,
  needsCvOnly,
  needsCvCount,
  onToggleNeedsCv,
}: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PipelineToggle
          value={pipeline}
          counts={pipelineCounts}
          onChange={onPipelineChange}
        />
        <div className="sm:w-72">
          <SearchBar value={query} onChange={onQueryChange} />
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter by status"
        className="-mx-1 flex snap-x items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <button
          onClick={onToggleNeedsCv}
          aria-pressed={needsCvOnly}
          className={`flex shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-all duration-200 ease-weighty ${
            needsCvOnly
              ? "border-[#C9A24B]/40 bg-[#C9A24B]/10 text-ink"
              : "border-line bg-surface/40 text-muted hover:text-ink/80"
          }`}
        >
          <span className="whitespace-nowrap">Needs CV</span>
          <span
            className={`font-mono text-[10px] ${
              needsCvOnly ? "text-[#C9A24B]" : "text-faint"
            }`}
          >
            {needsCvCount}
          </span>
        </button>

        <span className="h-5 w-px shrink-0 bg-line" />

        <Chip
          label="All"
          count={total}
          active={status === "All"}
          onClick={() => onStatusChange("All")}
        />
        {STATUSES.map((s) => (
          <Chip
            key={s}
            label={STATUS_META[s].label}
            count={statusCounts[s]}
            color={STATUS_META[s].color}
            active={status === s}
            onClick={() => onStatusChange(s)}
          />
        ))}
      </div>
    </div>
  );
}

interface ChipProps {
  label: string;
  count: number;
  color?: string;
  active: boolean;
  onClick: () => void;
}

function Chip({ label, count, color, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`group flex shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-all duration-200 ease-weighty ${
        active
          ? "border-accent/40 bg-accent/10 text-ink"
          : "border-line bg-surface/40 text-muted hover:border-line hover:text-ink/80"
      }`}
    >
      {color ? (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full transition-opacity"
          style={{
            backgroundColor: color,
            opacity: active ? 1 : 0.6,
          }}
          aria-hidden
        />
      ) : null}
      <span className="whitespace-nowrap">{label}</span>
      <span
        className={`font-mono text-[10px] ${
          active ? "text-accent-ink" : "text-faint"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
