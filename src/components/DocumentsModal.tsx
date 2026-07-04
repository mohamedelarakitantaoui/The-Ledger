import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Application,
  DocLanguage,
  DocType,
  GeneratedDoc,
  GeneratedDocInput,
  Profile,
} from "../types";
import { DOC_TYPES, DOC_TYPE_META } from "../constants";
import { generateDocument } from "../ai";
import { markdownToHtml } from "../utils/markdown";
import { exportMarkdownToPdf } from "../utils/pdf";
import { downloadMarkdown, slugify } from "../utils/download";
import { formatDate } from "../utils/format";
import { TextArea } from "./ui";

interface Props {
  app: Application;
  profile: Profile;
  /** Documents belonging to this application only. */
  documents: GeneratedDoc[];
  aiReady: boolean;
  onClose: () => void;
  onAdd: (input: GeneratedDocInput) => GeneratedDoc;
  onUpdate: (id: string, patch: Partial<GeneratedDocInput>) => GeneratedDoc | null;
  onDelete: (id: string) => void;
  onSetFinal: (applicationId: string, type: DocType, docId: string) => void;
  notify: (message: string, tone?: "info" | "error") => void;
}

export function DocumentsModal({
  app,
  profile,
  documents,
  aiReady,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
  onSetFinal,
  notify,
}: Props) {
  const [activeType, setActiveType] = useState<DocType>("cv");
  const [language, setLanguage] = useState<DocLanguage>("fr");
  const [prompt, setPrompt] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // After a generation completes, scroll the freshly created version into view.
  const activeChipRef = useRef<HTMLButtonElement>(null);
  const scrollToNewVersion = useRef(false);

  const meta = DOC_TYPE_META[activeType];

  const docsOfType = useMemo(
    () =>
      documents
        .filter((d) => d.type === activeType)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [documents, activeType],
  );

  // Keep a valid selection: hold the current one if it still exists, otherwise
  // fall back to the final version, else the most recent, else nothing.
  useEffect(() => {
    setSelectedId((prev) => {
      if (prev && docsOfType.some((d) => d.id === prev)) return prev;
      return (docsOfType.find((d) => d.isFinal) ?? docsOfType[0])?.id ?? null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, documents]);

  // Load the selected doc into the editor buffers.
  useEffect(() => {
    const doc = documents.find((d) => d.id === selectedId);
    if (doc) {
      setTitle(doc.title);
      setContent(doc.content);
      setLanguage(doc.language);
    } else {
      setTitle("");
      setContent("");
    }
    if (scrollToNewVersion.current) {
      scrollToNewVersion.current = false;
      // Let the chip render first, then bring it (and the editor) into view.
      requestAnimationFrame(() => {
        activeChipRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

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

  const selected = documents.find((d) => d.id === selectedId) ?? null;
  const dirty =
    !!selected && (selected.title !== title || selected.content !== content);

  function nextTitle(): string {
    const n = docsOfType.length + 1;
    return `${meta.short} · ${language.toUpperCase()} · v${n}`;
  }

  async function handleGenerate() {
    setError(null);
    if (meta.promptRequired && !prompt.trim()) {
      setError("Add the question(s) to answer first.");
      return;
    }
    setGenerating(true);
    try {
      const text = await generateDocument(activeType, profile, app, {
        language,
        customPrompt: prompt.trim() || undefined,
      });
      const doc = onAdd({
        applicationId: app.id,
        type: activeType,
        language,
        title: nextTitle(),
        content: text,
        isFinal: false,
      });
      scrollToNewVersion.current = true;
      setSelectedId(doc.id);
      notify("Document generated.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed.";
      setError(message);
    } finally {
      setGenerating(false);
    }
  }

  function handleNewBlank() {
    const doc = onAdd({
      applicationId: app.id,
      type: activeType,
      language,
      title: nextTitle(),
      content: "",
      isFinal: false,
    });
    setSelectedId(doc.id);
  }

  function handleSave() {
    if (!selected) return;
    onUpdate(selected.id, { title, content });
    notify("Document saved.");
  }

  function exportName(ext: string): string {
    return `${slugify(app.company)}-${activeType}-${language}.${ext}`;
  }

  async function handleExportPdf() {
    try {
      await exportMarkdownToPdf(content, exportName("pdf"));
    } catch {
      notify("Couldn't export the PDF.", "error");
    }
  }

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Documents"
        className="animate-panel relative flex h-full w-full max-w-5xl flex-col overflow-hidden border border-line bg-surface shadow-2xl sm:h-auto sm:max-h-[92dvh] sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">
              Documents
            </span>
            <h2 className="truncate font-serif text-2xl font-light text-ink">
              {app.company}
            </h2>
            <span className="truncate text-sm text-muted">{app.role}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-elevated hover:text-ink"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Doc-type tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-line px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DOC_TYPES.map((t) => {
            const active = t === activeType;
            const has = documents.some((d) => d.type === t);
            return (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`relative shrink-0 px-3.5 py-3 text-sm transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink/80"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {DOC_TYPE_META[t].label}
                  {has ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent/70" aria-hidden />
                  ) : null}
                </span>
                {active ? (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Scrollable body */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <p className="text-sm text-muted">{meta.blurb}</p>

          {/* Generation controls */}
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-elevated/40 p-4">
            {!aiReady ? (
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-ink">
                  AI generation not configured
                </span>
                <p className="text-sm text-muted">
                  Paste your Anthropic API key in <span className="text-ink">Settings</span> (the
                  gear icon in the header) to enable one-click drafts. You can still write and edit
                  documents by hand below.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <LanguageToggle value={language} onChange={setLanguage} />
                  {!profile.fullName ? (
                    <span className="font-mono text-[10px] tracking-wide text-faint">
                      tip: fill in My Profile for better results
                    </span>
                  ) : null}
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                    {meta.promptLabel}
                    {meta.promptRequired ? (
                      <span className="text-accent-ink"> *</span>
                    ) : null}
                  </span>
                  <TextArea
                    rows={meta.promptRequired ? 3 : 2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      meta.promptRequired
                        ? "Paste the application question(s) here…"
                        : "Optional: emphasise backend, mention relocation, set a tone…"
                    }
                  />
                </label>
                {error ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-[#B5604F]/30 bg-[#B5604F]/10 px-3.5 py-2.5"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B5604F]" aria-hidden />
                    <span className="text-sm leading-relaxed text-ink">{error}</span>
                  </div>
                ) : null}
                {generating ? (
                  <div
                    role="status"
                    className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-3.5 py-2.5"
                  >
                    <span className="text-accent-ink">
                      <Spinner />
                    </span>
                    <span className="text-sm text-ink">
                      Generating {meta.label.toLowerCase()}…
                    </span>
                    <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-wider text-faint sm:inline">
                      ~10–30 s
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-canvas transition-all duration-200 ease-weighty hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                  >
                    {generating ? (
                      <>
                        <Spinner />
                        Generating…
                      </>
                    ) : (
                      <>✦ Generate {meta.short}</>
                    )}
                  </button>
                  <button
                    onClick={handleNewBlank}
                    disabled={generating}
                    className="text-sm text-muted transition-colors hover:text-ink disabled:opacity-40"
                  >
                    or start blank
                  </button>
                </div>
              </>
            )}
            {!aiReady ? (
              <button
                onClick={handleNewBlank}
                className="self-start rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-accent/40 hover:text-accent-ink"
              >
                Start a blank {meta.short}
              </button>
            ) : null}
          </div>

          {/* Versions */}
          {docsOfType.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                Versions · {docsOfType.length}
              </span>
              <div className="flex flex-wrap gap-2">
                {docsOfType.map((d) => {
                  const active = d.id === selectedId;
                  return (
                    <button
                      key={d.id}
                      ref={active ? activeChipRef : undefined}
                      onClick={() => setSelectedId(d.id)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all duration-200 ease-weighty ${
                        active
                          ? d.isFinal
                            ? "border-[#C9A24B]/50 bg-[#C9A24B]/10 text-ink"
                            : "border-accent/40 bg-accent/10 text-ink"
                          : d.isFinal
                            ? "border-[#C9A24B]/25 bg-surface/40 text-muted hover:text-ink/80"
                            : "border-line bg-surface/40 text-muted hover:text-ink/80"
                      }`}
                    >
                      {d.isFinal ? (
                        <span className="text-[#C9A24B]" aria-label="Final">
                          ★
                        </span>
                      ) : null}
                      <span className="max-w-[14ch] truncate">{d.title}</span>
                      <span className="font-mono text-[9px] text-faint">
                        {formatDate(d.updatedAt.slice(0, 10))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Editor + live preview: side-by-side on desktop, stacked on mobile */}
          {selected ? (
            <div
              className={`flex flex-col gap-3 ${
                selected.isFinal
                  ? "-mx-3 rounded-2xl border border-[#C9A24B]/25 bg-[#C9A24B]/[0.03] px-3 pb-3 pt-2"
                  : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-base font-medium text-ink focus:outline-none"
                  aria-label="Document title"
                />
                {selected.isFinal ? (
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#C9A24B]">
                    ★ Final version
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                    Markdown
                  </span>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={18}
                    spellCheck={false}
                    placeholder="Write or generate your document in Markdown…"
                    className="min-h-72 w-full flex-1 resize-y rounded-2xl border border-line bg-elevated/30 p-4 font-mono text-[13px] leading-relaxed text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none lg:resize-none"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                    Preview
                  </span>
                  {content.trim() ? (
                    <div
                      className="md-preview max-h-[32rem] min-h-72 flex-1 overflow-y-auto rounded-2xl border border-line bg-elevated/30 p-5"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
                    />
                  ) : (
                    <p className="min-h-72 flex-1 rounded-2xl border border-dashed border-line bg-elevated/30 p-5 font-serif text-base italic text-faint">
                      Nothing to preview yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Editor actions */}
              <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                <button
                  onClick={handleSave}
                  disabled={!dirty}
                  className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-canvas transition-all duration-200 ease-weighty hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
                >
                  {dirty ? "Save" : "Saved"}
                </button>
                <button
                  onClick={() => onSetFinal(app.id, activeType, selected.id)}
                  disabled={selected.isFinal}
                  className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                    selected.isFinal
                      ? "border-[#C9A24B]/40 text-[#C9A24B] disabled:opacity-100"
                      : "border-line text-ink hover:border-[#C9A24B]/40 hover:text-[#C9A24B]"
                  }`}
                >
                  {selected.isFinal ? "★ Final" : "☆ Mark final"}
                </button>

                <span className="mx-1 h-4 w-px bg-line" />

                <button
                  onClick={handleExportPdf}
                  className="rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-ink"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => downloadMarkdown(content, exportName("md"))}
                  className="rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-ink"
                >
                  Export .md
                </button>

                <button
                  onClick={() => {
                    onDelete(selected.id);
                    notify("Document deleted.");
                  }}
                  className="ml-auto rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-faint transition-colors hover:text-[#B5604F]"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-line p-8 text-center font-serif text-base italic text-faint">
              No {meta.short} yet for this application.
              {aiReady ? " Generate one above" : " Start a blank version above"}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LanguageToggle({
  value,
  onChange,
}: {
  value: DocLanguage;
  onChange: (l: DocLanguage) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-line p-0.5">
      <SegBtn active={value === "fr"} onClick={() => onChange("fr")}>
        Français
      </SegBtn>
      <SegBtn active={value === "en"} onClick={() => onChange("en")}>
        English
      </SegBtn>
    </div>
  );
}

function SegBtn({
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
      className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
        active ? "bg-elevated text-ink" : "text-muted hover:text-ink/80"
      }`}
    >
      {children}
    </button>
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
