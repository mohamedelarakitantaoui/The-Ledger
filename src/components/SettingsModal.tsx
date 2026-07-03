import { useEffect, useState } from "react";
import {
  clearStoredKey,
  getStoredKey,
  isConfigured,
  keySource,
  setStoredKey,
  testApiKey,
} from "../ai";
import { fieldClass, Labeled } from "./ui";

interface Props {
  onClose: () => void;
  notify: (message: string, tone?: "info" | "error") => void;
}

type TestState =
  | { phase: "idle" }
  | { phase: "testing" }
  | { phase: "ok" }
  | { phase: "fail"; reason: string };

export function SettingsModal({ onClose, notify }: Props) {
  const [keyDraft, setKeyDraft] = useState(() => getStoredKey() ?? "");
  const [showKey, setShowKey] = useState(false);
  const [test, setTest] = useState<TestState>({ phase: "idle" });

  const source = keySource();
  const connected = isConfigured();
  const envManaged = source === "env";
  const dirty = keyDraft.trim() !== (getStoredKey() ?? "");

  // Esc to close + lock scroll.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function handleSave() {
    const trimmed = keyDraft.trim();
    try {
      if (trimmed) {
        setStoredKey(trimmed);
        notify("API key saved to this browser.");
      } else {
        clearStoredKey();
        notify("API key removed.");
      }
      setTest({ phase: "idle" });
    } catch (err) {
      notify(err instanceof Error ? err.message : "Couldn't save the key.", "error");
    }
  }

  function handleClear() {
    clearStoredKey();
    setKeyDraft("");
    setTest({ phase: "idle" });
    notify("API key removed.");
  }

  async function handleTest() {
    setTest({ phase: "testing" });
    try {
      // Test the draft if edited, otherwise whatever key is active.
      await testApiKey(dirty ? keyDraft : undefined);
      setTest({ phase: "ok" });
    } catch (err) {
      setTest({
        phase: "fail",
        reason: err instanceof Error ? err.message : "The test call failed.",
      });
    }
  }

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className="animate-panel relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">
              Settings
            </span>
            <h2 className="font-serif text-2xl font-light text-ink">
              AI generation
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-elevated hover:text-ink"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
          {/* Connection indicator */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-elevated/40 px-4 py-3">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                connected ? "bg-[#5FA37A]" : "bg-[#B5604F]"
              }`}
              aria-hidden
            />
            <span className="text-sm text-ink">
              {connected
                ? envManaged
                  ? "Key configured via .env"
                  : "Key saved in this browser"
                : "No API key configured"}
            </span>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              {connected ? "Connected" : "Off"}
            </span>
          </div>

          {envManaged ? (
            <p className="text-sm text-muted">
              A key is provided by <code className="font-mono text-xs text-ink">VITE_ANTHROPIC_API_KEY</code>{" "}
              in your <code className="font-mono text-xs text-ink">.env</code> file — it takes
              precedence over any key saved here.
            </p>
          ) : null}

          <Labeled label="Anthropic API key" hint="stored only in this browser">
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={keyDraft}
                onChange={(e) => {
                  setKeyDraft(e.target.value);
                  setTest({ phase: "idle" });
                }}
                placeholder="sk-ant-…"
                autoComplete="off"
                spellCheck={false}
                className={`${fieldClass} pr-16 font-mono text-xs`}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-ink"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
          </Labeled>

          <p className="text-sm text-muted">
            Get a key at{" "}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent-ink underline underline-offset-2 transition-colors hover:text-accent"
            >
              console.anthropic.com
            </a>
            . It never leaves this device except to call the Anthropic API when
            you generate a document.
          </p>

          {/* Test result */}
          {test.phase === "ok" ? (
            <div className="flex items-center gap-2.5 rounded-2xl border border-[#5FA37A]/30 bg-[#5FA37A]/10 px-4 py-3">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#5FA37A]" aria-hidden />
              <span className="text-sm text-ink">The key works — you're all set.</span>
            </div>
          ) : null}
          {test.phase === "fail" ? (
            <div className="flex items-start gap-2.5 rounded-2xl border border-[#B5604F]/30 bg-[#B5604F]/10 px-4 py-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#B5604F]" aria-hidden />
              <span className="text-sm text-ink">{test.reason}</span>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-3 border-t border-line px-6 py-4">
          <button
            onClick={handleTest}
            disabled={test.phase === "testing" || (!connected && !keyDraft.trim())}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm text-ink transition-colors hover:border-accent/40 hover:text-accent-ink disabled:opacity-40"
          >
            {test.phase === "testing" ? (
              <>
                <Spinner />
                Testing…
              </>
            ) : (
              "Test key"
            )}
          </button>

          {getStoredKey() ? (
            <button
              onClick={handleClear}
              className="rounded-full px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider text-faint transition-colors hover:text-[#B5604F]"
            >
              Remove key
            </button>
          ) : null}

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-full px-4 py-2.5 text-sm text-muted transition-colors hover:text-ink"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-canvas transition-all duration-200 ease-weighty hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
