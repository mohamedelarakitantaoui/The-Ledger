interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="group relative flex items-center">
      <svg
        className="pointer-events-none absolute left-3.5 h-4 w-4 text-faint transition-colors group-focus-within:text-accent-ink"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search company, role, city…"
        aria-label="Search applications"
        className="h-11 w-full rounded-full border border-line bg-surface/60 pl-10 pr-4 text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/50"
      />
    </div>
  );
}
