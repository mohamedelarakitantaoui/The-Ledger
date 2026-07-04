interface Props {
  /** True when the ledger has rows but the current filters hide them all. */
  filtered: boolean;
  onAdd: () => void;
  onClearFilters: () => void;
}

export function EmptyState({ filtered, onAdd, onClearFilters }: Props) {
  return (
    <div className="animate-rise flex flex-col items-center px-6 py-24 text-center">
      <p className="font-serif text-5xl font-light italic text-ink/80">
        {filtered ? "Nothing matches." : "A clean page."}
      </p>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
        {filtered
          ? "No applications fit the current filters. Try widening your search or switching pipeline."
          : "Every search starts here. Log your first application and watch the ledger fill up."}
      </p>
      <div className="mt-8">
        {filtered ? (
          <button
            onClick={onClearFilters}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-ink transition-colors hover:text-accent"
          >
            Clear filters
          </button>
        ) : (
          <button
            onClick={onAdd}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-canvas transition-all duration-200 ease-weighty hover:brightness-110"
          >
            Log an application
          </button>
        )}
      </div>
    </div>
  );
}
