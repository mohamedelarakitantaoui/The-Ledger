import type { Status } from "../types";
import { STATUS_META } from "../constants";

interface Props {
  status: Status;
  /** Slightly larger dot + text for the row header. */
  size?: "sm" | "md";
}

/**
 * Colour is carried by a single small dot so the palette stays quiet.
 * Label is set in mono, uppercased, with wide tracking.
 */
export function StatusBadge({ status, size = "md" }: Props) {
  const { label, color } = STATUS_META[status];
  const dot = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span
        className={`${dot} shrink-0 rounded-full`}
        style={{
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}66`,
        }}
        aria-hidden
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
    </span>
  );
}
