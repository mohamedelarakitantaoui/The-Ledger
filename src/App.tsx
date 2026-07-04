import { useEffect, useMemo, useState } from "react";
import type {
  Application,
  ApplicationInput,
  Pipeline,
  Status,
  StatusFilter,
} from "./types";
import { PIPELINES, STATUSES, DEFAULT_PIPELINE } from "./constants";
import { useApplications } from "./hooks/useApplications";
import { useProfile } from "./hooks/useProfile";
import { useDocuments } from "./hooks/useDocuments";
import { computeStats } from "./utils/stats";
import { todayISO } from "./utils/format";
import { isConfigured, subscribeKeyChange } from "./ai";
import { subscribeStorageError } from "./storage";

import { Header, type View } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { Filters } from "./components/Filters";
import { ApplicationList } from "./components/ApplicationList";
import { ApplicationModal } from "./components/ApplicationModal";
import { DocumentsModal } from "./components/DocumentsModal";
import { SettingsModal } from "./components/SettingsModal";
import { ProfilePage } from "./components/ProfilePage";
import { EmptyState } from "./components/EmptyState";
import { Toast, type ToastData } from "./components/Toast";

interface ModalState {
  open: boolean;
  editing: Application | null;
}

export default function App() {
  const { applications, add, update, remove, exportJson, importJson } =
    useApplications();
  const { profile, save: saveProfile } = useProfile();
  const docs = useDocuments();

  // Reactive: re-checks when the key is saved/cleared in Settings.
  const [aiReady, setAiReady] = useState(() => isConfigured());
  useEffect(() => subscribeKeyChange(() => setAiReady(isConfigured())), []);

  const [view, setView] = useState<View>("ledger");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pipeline, setPipeline] = useState<Pipeline>(DEFAULT_PIPELINE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");
  const [needsCvOnly, setNeedsCvOnly] = useState(false);
  const [modal, setModal] = useState<ModalState>({ open: false, editing: null });
  const [docsApp, setDocsApp] = useState<Application | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  function notify(message: string, tone: ToastData["tone"] = "info") {
    setToast({ id: Date.now(), message, tone });
  }

  // Storage failures (quota full, private-mode blocks) surface as a warning
  // toast instead of silently dropping the write.
  useEffect(
    () =>
      subscribeStorageError((message) =>
        setToast({ id: Date.now(), message, tone: "error" }),
      ),
    [],
  );

  // ---- Document indexes ---------------------------------------------------

  const cvAppIds = useMemo(() => {
    const set = new Set<string>();
    for (const d of docs.documents) if (d.type === "cv") set.add(d.applicationId);
    return set;
  }, [docs.documents]);

  const docCountByApp = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of docs.documents) {
      counts[d.applicationId] = (counts[d.applicationId] ?? 0) + 1;
    }
    return counts;
  }, [docs.documents]);

  // ---- Derived data -------------------------------------------------------

  const pipelineCounts = useMemo(() => {
    const counts = Object.fromEntries(PIPELINES.map((p) => [p, 0])) as Record<
      Pipeline,
      number
    >;
    for (const app of applications) counts[app.pipeline]++;
    return counts;
  }, [applications]);

  const pipelineApps = useMemo(
    () => applications.filter((a) => a.pipeline === pipeline),
    [applications, pipeline],
  );

  const stats = useMemo(() => computeStats(pipelineApps), [pipelineApps]);

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<
      Status,
      number
    >;
    for (const app of pipelineApps) counts[app.status]++;
    return counts;
  }, [pipelineApps]);

  const needsCvCount = useMemo(
    () => pipelineApps.filter((a) => !cvAppIds.has(a.id)).length,
    [pipelineApps, cvAppIds],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pipelineApps
      .filter((a) => statusFilter === "All" || a.status === statusFilter)
      .filter((a) => !needsCvOnly || !cvAppIds.has(a.id))
      .filter((a) => {
        if (!q) return true;
        return (
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const byDate = b.dateApplied.localeCompare(a.dateApplied);
        return byDate !== 0 ? byDate : b.createdAt.localeCompare(a.createdAt);
      });
  }, [pipelineApps, statusFilter, query, needsCvOnly, cvAppIds]);

  const filtersActive =
    statusFilter !== "All" || query.trim() !== "" || needsCvOnly;

  // ---- Handlers -----------------------------------------------------------

  function openNew() {
    setModal({ open: true, editing: null });
  }
  function openEdit(app: Application) {
    setModal({ open: true, editing: app });
  }
  function closeModal() {
    setModal({ open: false, editing: null });
  }

  function handleSubmit(input: ApplicationInput) {
    if (modal.editing) {
      update(modal.editing.id, input);
      notify("Application updated.");
    } else {
      add(input);
      notify("Application logged.");
    }
    setPipeline(input.pipeline);
    if (statusFilter !== "All" && statusFilter !== input.status) {
      setStatusFilter("All");
    }
    closeModal();
  }

  function handleDelete(id: string) {
    remove(id);
    notify("Application removed.");
  }

  function handleExport() {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `the-ledger-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Backup exported.");
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const r = importJson(text);
      setStatusFilter("All");
      setQuery("");
      setNeedsCvOnly(false);
      const extras = [
        r.documents ? `${r.documents} documents` : "",
        r.profile ? "profile" : "",
      ].filter(Boolean);
      notify(
        `Imported ${r.applications} application${
          r.applications === 1 ? "" : "s"
        }${extras.length ? ` + ${extras.join(" + ")}` : ""}.`,
      );
    } catch (err) {
      notify(err instanceof Error ? err.message : "Import failed.", "error");
    }
  }

  // ---- Render -------------------------------------------------------------

  return (
    <>
      <div className="ambient" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-24 sm:px-8">
        <Header
          view={view}
          onViewChange={setView}
          onNew={openNew}
          onExport={handleExport}
          onImportFile={handleImportFile}
          onOpenSettings={() => setSettingsOpen(true)}
          aiReady={aiReady}
        />

        {view === "profile" ? (
          <div className="mt-10">
            <ProfilePage
              profile={profile}
              onSave={(p) => {
                saveProfile(p);
                notify("Profile saved.");
              }}
            />
          </div>
        ) : (
          <>
            <div className="mt-10 sm:mt-14">
              <Dashboard stats={stats} pipelineLabel={pipeline} />
            </div>

            <div className="mt-10">
              <Filters
                pipeline={pipeline}
                pipelineCounts={pipelineCounts}
                onPipelineChange={setPipeline}
                status={statusFilter}
                statusCounts={statusCounts}
                total={pipelineApps.length}
                onStatusChange={setStatusFilter}
                query={query}
                onQueryChange={setQuery}
                needsCvOnly={needsCvOnly}
                needsCvCount={needsCvCount}
                onToggleNeedsCv={() => setNeedsCvOnly((v) => !v)}
              />
            </div>

            <main className="mt-8">
              {visible.length > 0 ? (
                <ApplicationList
                  applications={visible}
                  cvAppIds={cvAppIds}
                  docCountByApp={docCountByApp}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onOpenDocs={setDocsApp}
                />
              ) : (
                <EmptyState
                  filtered={filtersActive}
                  onAdd={openNew}
                  onClearFilters={() => {
                    setStatusFilter("All");
                    setQuery("");
                    setNeedsCvOnly(false);
                  }}
                />
              )}
            </main>
          </>
        )}

        <footer className="mt-20 border-t border-line pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            Stored locally on this device · nothing leaves your browser
            {aiReady ? " · AI generation on" : ""}
          </p>
        </footer>
      </div>

      {modal.open ? (
        <ApplicationModal
          key={modal.editing?.id ?? "new"}
          editing={modal.editing}
          defaultPipeline={pipeline}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      ) : null}

      {settingsOpen ? (
        <SettingsModal onClose={() => setSettingsOpen(false)} notify={notify} />
      ) : null}

      {docsApp ? (
        <DocumentsModal
          key={docsApp.id}
          app={docsApp}
          profile={profile}
          documents={docs.documents.filter(
            (d) => d.applicationId === docsApp.id,
          )}
          aiReady={aiReady}
          onClose={() => setDocsApp(null)}
          onAdd={docs.add}
          onUpdate={docs.update}
          onDelete={docs.remove}
          onSetFinal={docs.setFinal}
          notify={notify}
        />
      ) : null}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
