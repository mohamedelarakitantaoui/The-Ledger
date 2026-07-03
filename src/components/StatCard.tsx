interface Props {
  label: string;
  value: string | number;
  /** Render the value in the warm accent (used for the headline figure). */
  accent?: boolean;
  hint?: string;
}

export function StatCard({ label, value, accent, hint }: Props) {
  return (
    <div className="flex flex-col gap-2 py-5 sm:py-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
        {label}
      </span>
      <span
        className={`font-serif text-4xl font-light leading-none tabular-nums sm:text-5xl ${
          accent ? "text-accent-ink" : "text-ink"
        }`}
      >
        {value}
      </span>
      {hint ? (
        <span className="font-mono text-[10px] tracking-wide text-faint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
