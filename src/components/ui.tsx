import { useState } from "react";

/** Shared form-field styling used across the modal, profile page, and editor. */
export const fieldClass =
  "h-11 w-full rounded-xl border border-line bg-elevated/60 px-3.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/50";

interface LabeledProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function Labeled({
  label,
  required,
  hint,
  error,
  className,
  children,
}: LabeledProps) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
        {label}
        {required ? <span className="text-accent-ink">*</span> : null}
        {hint ? (
          <span className="lowercase tracking-normal text-faint/70">· {hint}</span>
        ) : null}
      </span>
      {children}
      {error ? (
        <span className="font-mono text-[10px] text-[#B5604F]">{error}</span>
      ) : null}
    </label>
  );
}

interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function TextInput(props: TextInputProps) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea(props: TextAreaProps) {
  return (
    <textarea
      {...props}
      className={`${fieldClass} h-auto resize-y py-3 leading-relaxed ${
        props.className ?? ""
      }`}
    />
  );
}

interface SelectFieldProps {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  /** Optional display labels keyed by option value. */
  labels?: Record<string, string>;
}

export function SelectField({
  value,
  options,
  onChange,
  labels,
}: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ colorScheme: "dark" }}
        className={`${fieldClass} cursor-pointer appearance-none pr-9`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labels?.[opt] ?? opt}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

interface TagInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

/** Chip-style input — Enter or comma adds a tag; × or Backspace removes one. */
export function TagInput({ values, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const tag = raw.trim().replace(/,$/, "").trim();
    if (tag && !values.includes(tag)) onChange([...values, tag]);
    setDraft("");
  };

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-line bg-elevated/60 p-2 transition-colors focus-within:border-accent/50">
      {values.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs text-ink"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(values.filter((t) => t !== tag))}
            className="text-faint transition-colors hover:text-accent-ink"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && draft === "" && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={() => draft.trim() && commit(draft)}
        placeholder={values.length ? "" : placeholder}
        className="min-w-[8ch] flex-1 bg-transparent px-1.5 py-1 text-sm text-ink placeholder:text-faint focus:outline-none"
      />
    </div>
  );
}
