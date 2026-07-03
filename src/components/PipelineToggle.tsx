import type { Pipeline } from "../types";
import { PIPELINES } from "../constants";

interface Props {
  value: Pipeline;
  counts: Record<Pipeline, number>;
  onChange: (pipeline: Pipeline) => void;
}

/** Two-option segmented control with a sliding warm indicator. */
export function PipelineToggle({ value, counts, onChange }: Props) {
  const activeIndex = PIPELINES.indexOf(value);
  return (
    <div
      role="tablist"
      aria-label="Pipeline"
      className="relative grid grid-cols-2 rounded-full border border-line bg-surface/60 p-1 backdrop-blur-sm"
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full bg-elevated transition-transform duration-500 ease-weighty"
        style={{
          width: "calc(50% - 0.25rem)",
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {PIPELINES.map((pipeline) => {
        const active = pipeline === value;
        return (
          <button
            key={pipeline}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(pipeline)}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors duration-300 sm:text-sm ${
              active ? "text-ink" : "text-muted hover:text-ink/80"
            }`}
          >
            <span className="truncate">{pipeline}</span>
            <span className="font-mono text-[10px] text-faint">
              {counts[pipeline]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
