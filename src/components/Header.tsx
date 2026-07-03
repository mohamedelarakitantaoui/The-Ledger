import { useRef } from "react";

export type View = "ledger" | "profile";

interface Props {
  view: View;
  onViewChange: (view: View) => void;
  onNew: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
}

export function Header({
  view,
  onViewChange,
  onNew,
  onExport,
  onImportFile,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <header className="flex flex-col gap-6 pt-10 sm:pt-14">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-faint">
            Job application tracker
          </span>
          <h1 className="font-serif text-5xl font-light leading-[0.95] tracking-tight text-ink sm:text-6xl">
            The Ledger
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <IconButton label="Import backup" onClick={() => fileRef.current?.click()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 15V3" strokeLinecap="round" />
              <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 19h14" strokeLinecap="round" />
            </svg>
          </IconButton>
          <IconButton label="Export to JSON" onClick={onExport}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 3v12" strokeLinecap="round" />
              <path d="m7 8 5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 19h14" strokeLinecap="round" />
            </svg>
          </IconButton>

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportFile(file);
              e.target.value = "";
            }}
          />

          {view === "ledger" ? (
            <button
              onClick={onNew}
              className="ml-1 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-canvas transition-all duration-300 ease-weighty hover:brightness-110 active:scale-[0.98]"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">New</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* View navigation */}
      <nav className="flex items-center gap-6 border-b border-line">
        <Tab active={view === "ledger"} onClick={() => onViewChange("ledger")}>
          Ledger
        </Tab>
        <Tab active={view === "profile"} onClick={() => onViewChange("profile")}>
          My Profile
        </Tab>
      </nav>
    </header>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative -mb-px pb-3 text-sm transition-colors ${
        active ? "text-ink" : "text-muted hover:text-ink/80"
      }`}
    >
      {children}
      {active ? (
        <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />
      ) : null}
    </button>
  );
}

interface IconButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-all duration-300 hover:border-line hover:text-ink [&>svg]:h-4.5 [&>svg]:w-4.5"
    >
      {children}
    </button>
  );
}
