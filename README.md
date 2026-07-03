# The Ledger

A quiet, local-first tracker for job applications — with per-job document
preparation. Keep tabs on many applications across Moroccan and French platforms
(who accepted you, who rejected you, what's still pending), maintain one master
profile, and generate a tailored CV, cover letter, intro message, or Q&A answers
for each application.

No backend. No accounts. Everything lives in `localStorage`. AI document
generation is an **optional** enhancement — the app is fully usable without it.

> Dark, minimal-luxury aesthetic — near-black surfaces, a warm off-white, and a
> single orange accent used sparingly. Thin serif headings, neo-grotesque UI,
> mono micro-labels.

---

## Run it

Requires **Node 18+**.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>).

### Optional — enable AI document generation

Copy the env template and paste an Anthropic API key, then restart `npm run dev`:

```bash
cp .env.example .env
# edit .env →  VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at <https://console.anthropic.com/>. Without a key, you can still write
and edit every document by hand — only the one-click "Generate" buttons are off.

> ⚠️ **Key visibility.** Vite inlines `VITE_*` variables into the built JavaScript,
> so the key is present in the client bundle. That's fine for a **local, personal**
> tool, but **do not deploy this publicly with a real key.** For a hosted version,
> move generation behind a small server proxy that keeps the key server-side and
> exposes the same `generateDocument` shape — only `ai.ts` would change.

### Other scripts

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
npm run typecheck  # type-check only
```

---

## Features

### Tracking
- **Add / edit / delete** applications via a modal form (company + role required).
- **Live dashboard** — total logged, in-the-running (Applied + Pending +
  Interview), interviews, offers, and response rate
  `(Interview + Accepted + Rejected) / (non-Wishlist)`.
- **Pipeline toggle** — _Job (Morocco)_ vs _Master/Alternance (France)_; the
  dashboard and list both follow it.
- **Status filter chips**, **search** (company / role / city), and a **Needs CV**
  filter that surfaces applications with no CV prepared yet.
- **Accordion ledger rows** sorted by date applied (newest first); colour-coded
  status; a quiet **No CV** badge on rows still missing a CV.
- **Export / Import** everything (applications + profile + documents) as JSON.
- **Fully responsive**, phone-first. Seeded with example data on first launch.

### Documents
- **My Profile** page — one reusable source of truth: identity, contact, summary,
  categorised skills, experience, projects, education, languages, certifications.
- **Per-application Documents** workspace with four document types:
  **Tailored CV**, **Cover letter**, **Intro message**, **Application Q&A**.
- **AI generation** combines your profile + the saved job (company, role, notes /
  description) + the document type, instructing the model to tailor wording,
  reorder skills to match the role, and stay ATS-friendly (one column, no tables).
  **CV language defaults to French**, with an English toggle.
- **Editable** in a Markdown editor with live preview before saving.
- **Multiple versions** per application; mark one **final** (★) per type.
- **Export** each document to **PDF** (real, selectable text — ATS-safe) and to
  **Markdown**.

---

## Per-job documents & AI

1. Fill in **My Profile** once (it's seeded with an example to start).
2. On any application, expand the row → **Documents**.
3. Pick a type tab, choose the language, optionally add steering (for **Q&A**,
   paste the questions), and hit **Generate** — or **start blank** and write it
   yourself.
4. Edit in Markdown, **Save**, **Mark final**, and **Export PDF / .md**.

Generation uses the Anthropic Messages API (`claude-sonnet-4-6`) via a direct
`fetch` from the browser. All API logic is isolated in
[`src/ai.ts`](src/ai.ts), behind one function:

```ts
generateDocument(type, profile, job, extra) // -> Promise<string> (Markdown)
```

---

## Data model

One application: `id`, `company`*, `role`*, `platform` (ReKrute · LinkedIn ·
Indeed Maroc · Maroc Emploi IT · Emploi.ma · Company site · ESN/Referral ·
Other), `pipeline` (Job (Morocco) · Master/Alternance (France), default the
former), `status` (Wishlist · Applied · Pending · Interview · Accepted · Rejected
· Ghosted), `city`, `salary?`, `jobUrl?`, `dateApplied`, `notes`, `createdAt`,
`updatedAt`. (* required.)

Plus a single **Profile** object and a list of **GeneratedDoc**s (each linked to
an application by id, with `type`, `language`, `content`, `isFinal`, timestamps).
All types live in [`src/types.ts`](src/types.ts).

---

## Project structure

```
src/
  types.ts                 # domain types (framework-agnostic)
  constants.ts             # enums, status colours, doc-type metadata
  seed.ts                  # example applications + example profile (first run)
  storage.ts               # ← single persistence module (applications · profile · documents)
  ai.ts                    # ← single AI module (Anthropic Messages API)
  hooks/
    useApplications.ts · useProfile.ts · useDocuments.ts
  utils/
    format.ts              # ids, dates, relative time
    stats.ts               # dashboard figures
    markdown.ts            # markdown → HTML (preview)
    pdf.ts                 # markdown → PDF (jsPDF, lazy-loaded)
    download.ts            # blob / file download helpers
  components/
    Header.tsx · Dashboard.tsx · StatCard.tsx
    Filters.tsx · PipelineToggle.tsx · SearchBar.tsx
    ApplicationList.tsx · ApplicationRow.tsx · ApplicationModal.tsx
    ProfilePage.tsx        # master profile editor
    DocumentsModal.tsx     # generate / edit / version / export per application
    ui.tsx                 # shared form primitives
    StatusBadge.tsx · EmptyState.tsx · Toast.tsx
  App.tsx · main.tsx · index.css
```

---

## The storage layer (and a future browser extension)

All persistence is isolated in **[`src/storage.ts`](src/storage.ts)** so a future
browser extension ("save current job page to tracker") can reuse the exact same
API without touching the UI.

```ts
import { addApplication, subscribe } from "./storage";

// From a content script / popup, one call is enough:
addApplication({
  company: "Acme",
  role: "Frontend Engineer",
  platform: "LinkedIn",
  pipeline: "Job (Morocco)",
  status: "Applied",
  city: "Casablanca",
  jobUrl: location.href,
  dateApplied: "2026-06-07",
  notes: "",
});
```

| function                                  | purpose                                       |
| ----------------------------------------- | --------------------------------------------- |
| `loadApplications()` / `getApplication(id)` | read all / one (seeds on first run)          |
| `addApplication(input)`                   | create (adds `id` + timestamps), returns it   |
| `updateApplication(id, patch)`            | partial update                                 |
| `deleteApplication(id)`                   | remove (also deletes its documents)            |
| `loadProfile()` / `saveProfile(p)`        | read / write the master profile                |
| `loadDocuments()` / `getDocumentsFor(id)` | read all / per-application documents            |
| `addDocument` / `updateDocument` / `deleteDocument` | document CRUD                         |
| `setFinalDocument(appId, type, docId)`    | mark one final per (application, type)         |
| `exportData()` / `importData(json)`       | full JSON backup + restore                     |
| `subscribe(listener)`                     | live updates (same tab **and** across tabs)    |
| `STORAGE_KEY` / `PROFILE_KEY` / `DOCUMENTS_KEY` | the localStorage keys                    |

Writes notify subscribers, so an open Ledger tab updates live when the extension
saves a job — including from another tab, via the browser `storage` event.

---

## Notes

- Storage keys: `the-ledger.applications.v1`, `the-ledger.profile.v1`,
  `the-ledger.documents.v1`. Clearing browser data wipes them — use **Export** for
  backups.
- No analytics. Network requests happen only when you click **Generate** (to the
  Anthropic API) and for the Google Fonts stylesheet in `index.html`.
