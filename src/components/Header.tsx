import { useRef } from "react";

export type View = "ledger" | "profile";

interface Props {
  view: View;
  onViewChange: (view: View) => void;
  onNew: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onOpenSettings: () => void;
  /** Whether an API key is configured — drives the settings status dot. */
  aiReady: boolean;
}

export function Header({
  view,
  onViewChange,
  onNew,
  onExport,
  onImportFile,
  onOpenSettings,
  aiReady,
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
          <span className="relative">
            <IconButton label="Settings" onClick={onOpenSettings}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
            <span
              className={`pointer-events-none absolute right-0.5 top-0.5 h-2 w-2 rounded-full border border-canvas ${
                aiReady ? "bg-[#5FA37A]" : "bg-[#B5604F]"
              }`}
              title={aiReady ? "API key configured" : "No API key"}
              aria-hidden
            />
          </span>

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
              className="ml-1 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-canvas transition-all duration-200 ease-weighty hover:brightness-110 active:scale-[0.98]"
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
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-all duration-200 hover:border-line hover:text-ink [&>svg]:h-4.5 [&>svg]:w-4.5"
    >
      {children}
    </button>
  );
}
