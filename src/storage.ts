/**
 * storage.ts — the single source of truth for The Ledger's data.
 *
 * Everything that touches localStorage lives here. The UI (and, later, a
 * browser extension that wants to "save current job page to tracker") should
 * only ever import from this module. AI logic lives separately in `ai.ts`.
 *
 * Three independent stores, each under its own key:
 *   - applications  (the ledger)
 *   - profile       (the master CV/profile, single object)
 *   - documents     (generated docs, linked to applications by id)
 *
 * Public API
 * ----------
 *   Applications:
 *     loadApplications() · getApplication(id) · addApplication(input)
 *     updateApplication(id, patch) · deleteApplication(id) · replaceAll(apps)
 *   Profile:
 *     loadProfile() · saveProfile(profile)
 *   Documents:
 *     loadDocuments() · getDocumentsFor(applicationId)
 *     addDocument(input) · updateDocument(id, patch) · deleteDocument(id)
 *     setFinalDocument(applicationId, type, docId)
 *   Backup:
 *     exportData() · importData(json)
 *   Reactivity:
 *     subscribe(listener) -> unsubscribe   (same-tab + cross-tab `storage` event)
 *   Keys: STORAGE_KEY, PROFILE_KEY, DOCUMENTS_KEY
 *
 * For the future extension, `addApplication` is all a content script needs —
 * pass a partial-ish ApplicationInput and it returns a fully-formed, persisted
 * Application. Writes notify subscribers, so an open Ledger tab updates live.
 */

import type {
  Application,
  ApplicationInput,
  ApplicationPatch,
  CertificationEntry,
  ContactInfo,
  DocLanguage,
  DocType,
  EducationEntry,
  ExperienceEntry,
  GeneratedDoc,
  GeneratedDocInput,
  LanguageEntry,
  LedgerExport,
  Pipeline,
  Platform,
  Profile,
  ProjectEntry,
  Status,
} from "./types";
import {
  DEFAULT_PIPELINE,
  DOC_TYPES,
  PIPELINES,
  PLATFORMS,
  STATUSES,
} from "./constants";
import { emptyProfile, seedApplications, seedProfile } from "./seed";
import { generateId, todayISO } from "./utils/format";

export const STORAGE_KEY = "the-ledger.applications.v1";
export const PROFILE_KEY = "the-ledger.profile.v1";
export const DOCUMENTS_KEY = "the-ledger.documents.v1";

const OWNED_KEYS = new Set([STORAGE_KEY, PROFILE_KEY, DOCUMENTS_KEY]);

// ---------------------------------------------------------------------------
// Subscriptions — generic "something changed" signal
// ---------------------------------------------------------------------------

type Listener = () => void;
const listeners = new Set<Listener>();
let storageEventBound = false;

function notify(): void {
  for (const listener of listeners) listener();
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key !== null && !OWNED_KEYS.has(event.key)) return;
  notify();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  if (!storageEventBound && typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageEvent);
    storageEventBound = true;
  }
  return () => {
    listeners.delete(listener);
  };
}

// ---------------------------------------------------------------------------
// Low-level read / write
// ---------------------------------------------------------------------------

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function readJSON<T>(key: string): T | null {
  if (!hasStorage()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Storage-failure signal — full quota, private-mode restrictions, etc.
// The UI subscribes to surface a warning instead of failing silently.
// ---------------------------------------------------------------------------

type ErrorListener = (message: string) => void;
const errorListeners = new Set<ErrorListener>();

export function subscribeStorageError(listener: ErrorListener): () => void {
  errorListeners.add(listener);
  return () => {
    errorListeners.delete(listener);
  };
}

function reportStorageError(message: string): void {
  for (const listener of errorListeners) listener(message);
  if (errorListeners.size === 0 && typeof console !== "undefined") {
    console.warn(`[the-ledger] ${message}`);
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!hasStorage()) {
    reportStorageError(
      "Browser storage is unavailable — changes won't survive a reload. Export a backup.",
    );
    notify();
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // QuotaExceededError (or a private-mode write block).
    reportStorageError(
      "Browser storage is full — the last change couldn't be saved. Export a backup and clear old data.",
    );
  }
  notify();
}

// ---------------------------------------------------------------------------
// Small coercion helpers
// ---------------------------------------------------------------------------

function oneOf<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return typeof value === "string" && (allowed as string[]).includes(value)
    ? (value as T)
    : fallback;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function strArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

function normalizeApp(input: unknown): Application {
  const raw = (input ?? {}) as Record<string, unknown>;
  const now = new Date().toISOString();
  return {
    id: str(raw.id) || generateId(),
    company: str(raw.company).trim(),
    role: str(raw.role).trim(),
    platform: oneOf<Platform>(raw.platform, PLATFORMS, "Other"),
    pipeline: oneOf<Pipeline>(raw.pipeline, PIPELINES, DEFAULT_PIPELINE),
    status: oneOf<Status>(raw.status, STATUSES, "Applied"),
    city: str(raw.city).trim(),
    salary: str(raw.salary).trim() || undefined,
    jobUrl: str(raw.jobUrl).trim() || undefined,
    dateApplied: str(raw.dateApplied) || todayISO(),
    notes: str(raw.notes),
    createdAt: str(raw.createdAt) || now,
    updatedAt: str(raw.updatedAt) || now,
  };
}

function readApplications(): Application[] | null {
  const parsed = readJSON<unknown>(STORAGE_KEY);
  if (!Array.isArray(parsed)) return null;
  return parsed.map(normalizeApp);
}

/** Load all applications. Seeds the example data on first ever run. */
export function loadApplications(): Application[] {
  const existing = readApplications();
  if (existing) return existing;
  const seeded = seedApplications();
  writeJSON(STORAGE_KEY, seeded);
  return seeded;
}

export function getApplication(id: string): Application | undefined {
  return loadApplications().find((a) => a.id === id);
}

export function addApplication(input: ApplicationInput): Application {
  const now = new Date().toISOString();
  const app = normalizeApp({
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  });
  writeJSON(STORAGE_KEY, [app, ...loadApplications()]);
  return app;
}

export function updateApplication(
  id: string,
  patch: ApplicationPatch,
): Application | null {
  const apps = loadApplications();
  let updated: Application | null = null;
  const next = apps.map((a) => {
    if (a.id !== id) return a;
    updated = normalizeApp({
      ...a,
      ...patch,
      id: a.id,
      createdAt: a.createdAt,
      updatedAt: new Date().toISOString(),
    });
    return updated;
  });
  if (updated) writeJSON(STORAGE_KEY, next);
  return updated;
}

/** Deleting an application also removes the documents prepared for it. */
export function deleteApplication(id: string): void {
  const apps = loadApplications();
  const next = apps.filter((a) => a.id !== id);
  if (next.length !== apps.length) {
    writeJSON(STORAGE_KEY, next);
    const docs = loadDocuments();
    const remaining = docs.filter((d) => d.applicationId !== id);
    if (remaining.length !== docs.length) {
      writeJSON(DOCUMENTS_KEY, remaining);
    }
  }
}

/** Replace the entire ledger (used by import / restore). */
export function replaceAll(apps: Application[]): Application[] {
  const normalized = apps.map(normalizeApp);
  writeJSON(STORAGE_KEY, normalized);
  return normalized;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

function normalizeContact(input: unknown): ContactInfo {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    email: str(raw.email),
    phone: str(raw.phone),
    city: str(raw.city),
    linkedin: str(raw.linkedin),
    github: str(raw.github),
    portfolio: str(raw.portfolio),
  };
}

function normalizeExperience(input: unknown): ExperienceEntry {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    id: str(raw.id) || generateId(),
    company: str(raw.company),
    role: str(raw.role),
    location: str(raw.location),
    start: str(raw.start),
    end: str(raw.end),
    bullets: str(raw.bullets),
  };
}

function normalizeProject(input: unknown): ProjectEntry {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    id: str(raw.id) || generateId(),
    name: str(raw.name),
    stack: str(raw.stack),
    description: str(raw.description),
    outcome: str(raw.outcome),
    url: str(raw.url),
  };
}

function normalizeEducation(input: unknown): EducationEntry {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    id: str(raw.id) || generateId(),
    school: str(raw.school),
    degree: str(raw.degree),
    field: str(raw.field),
    start: str(raw.start),
    end: str(raw.end),
    location: str(raw.location),
  };
}

function normalizeLanguage(input: unknown): LanguageEntry {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    id: str(raw.id) || generateId(),
    name: str(raw.name),
    level: str(raw.level),
  };
}

function normalizeCertification(input: unknown): CertificationEntry {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    id: str(raw.id) || generateId(),
    name: str(raw.name),
    issuer: str(raw.issuer),
    year: str(raw.year),
  };
}

function arr<T>(value: unknown, fn: (item: unknown) => T): T[] {
  return Array.isArray(value) ? value.map(fn) : [];
}

function normalizeProfile(input: unknown): Profile {
  const raw = (input ?? {}) as Record<string, unknown>;
  const skills = (raw.skills ?? {}) as Record<string, unknown>;
  return {
    fullName: str(raw.fullName),
    title: str(raw.title),
    contact: normalizeContact(raw.contact),
    summary: str(raw.summary),
    skills: {
      languages: strArray(skills.languages),
      frameworks: strArray(skills.frameworks),
      tools: strArray(skills.tools),
    },
    experience: arr(raw.experience, normalizeExperience),
    projects: arr(raw.projects, normalizeProject),
    education: arr(raw.education, normalizeEducation),
    languages: arr(raw.languages, normalizeLanguage),
    certifications: arr(raw.certifications, normalizeCertification),
    updatedAt: str(raw.updatedAt) || new Date().toISOString(),
  };
}

/** Load the master profile. Seeds an example profile on first ever run. */
export function loadProfile(): Profile {
  const parsed = readJSON<unknown>(PROFILE_KEY);
  if (parsed && typeof parsed === "object") return normalizeProfile(parsed);
  const seeded = seedProfile();
  writeJSON(PROFILE_KEY, seeded);
  return seeded;
}

export function saveProfile(profile: Profile): Profile {
  const normalized = normalizeProfile({
    ...profile,
    updatedAt: new Date().toISOString(),
  });
  writeJSON(PROFILE_KEY, normalized);
  return normalized;
}

/** A blank profile factory, re-exported for convenience. */
export { emptyProfile };

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

function normalizeDoc(input: unknown): GeneratedDoc {
  const raw = (input ?? {}) as Record<string, unknown>;
  const now = new Date().toISOString();
  return {
    id: str(raw.id) || generateId(),
    applicationId: str(raw.applicationId),
    type: oneOf<DocType>(raw.type, DOC_TYPES, "cv"),
    language: oneOf<DocLanguage>(raw.language, ["fr", "en"], "fr"),
    title: str(raw.title) || "Untitled",
    content: str(raw.content),
    isFinal: raw.isFinal === true,
    createdAt: str(raw.createdAt) || now,
    updatedAt: str(raw.updatedAt) || now,
  };
}

export function loadDocuments(): GeneratedDoc[] {
  const parsed = readJSON<unknown>(DOCUMENTS_KEY);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeDoc);
}

export function getDocumentsFor(applicationId: string): GeneratedDoc[] {
  return loadDocuments().filter((d) => d.applicationId === applicationId);
}

export function addDocument(input: GeneratedDocInput): GeneratedDoc {
  const now = new Date().toISOString();
  const doc = normalizeDoc({
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  });
  let docs = [doc, ...loadDocuments()];
  // Keep the "one final per (application, type)" invariant.
  if (doc.isFinal) docs = clearFinalExcept(docs, doc);
  writeJSON(DOCUMENTS_KEY, docs);
  return doc;
}

export function updateDocument(
  id: string,
  patch: Partial<GeneratedDocInput>,
): GeneratedDoc | null {
  const docs = loadDocuments();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  const current = docs[idx];
  const updated = normalizeDoc({
    ...current,
    ...patch,
    id: current.id,
    applicationId: current.applicationId,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  });
  let next = docs.slice();
  next[idx] = updated;
  if (updated.isFinal) next = clearFinalExcept(next, updated);
  writeJSON(DOCUMENTS_KEY, next);
  return updated;
}

export function deleteDocument(id: string): void {
  const docs = loadDocuments();
  const next = docs.filter((d) => d.id !== id);
  if (next.length !== docs.length) writeJSON(DOCUMENTS_KEY, next);
}

/** Mark one document final for its (application, type); unmark the rest. */
export function setFinalDocument(
  applicationId: string,
  type: DocType,
  docId: string,
): void {
  const next = loadDocuments().map((d) => {
    if (d.applicationId !== applicationId || d.type !== type) return d;
    return { ...d, isFinal: d.id === docId, updatedAt: new Date().toISOString() };
  });
  writeJSON(DOCUMENTS_KEY, next);
}

function clearFinalExcept(
  docs: GeneratedDoc[],
  keep: GeneratedDoc,
): GeneratedDoc[] {
  return docs.map((d) =>
    d.id !== keep.id &&
    d.applicationId === keep.applicationId &&
    d.type === keep.type &&
    d.isFinal
      ? { ...d, isFinal: false }
      : d,
  );
}

// ---------------------------------------------------------------------------
// Export / Import (everything: applications + profile + documents)
// ---------------------------------------------------------------------------

export function exportData(): string {
  const payload: LedgerExport = {
    app: "the-ledger",
    version: 2,
    exportedAt: new Date().toISOString(),
    applications: loadApplications(),
    profile: loadProfile(),
    documents: loadDocuments(),
  };
  return JSON.stringify(payload, null, 2);
}

export interface ImportResult {
  applications: number;
  documents: number;
  profile: boolean;
}

/**
 * Parse and persist a JSON backup. Accepts a bare array of applications (v1) or
 * the full `{ applications, profile, documents }` envelope (v2). Throws on
 * malformed input.
 */
export function importData(json: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  const isEnvelope = !Array.isArray(parsed) && typeof parsed === "object";
  const envelope = (parsed ?? {}) as Record<string, unknown>;
  const list = Array.isArray(parsed) ? parsed : envelope.applications;

  if (!Array.isArray(list)) {
    throw new Error("Couldn't find any applications in that file.");
  }

  // Validate EVERYTHING before touching storage, so a malformed file can
  // never partially overwrite (or wipe) existing data.
  const apps = list
    .filter((entry) => entry && typeof entry === "object")
    .map(normalizeApp)
    .filter((a) => a.company || a.role);

  if (list.length > 0 && apps.length === 0) {
    throw new Error(
      "That file doesn't look like a Ledger backup — no valid applications in it.",
    );
  }

  let docs: GeneratedDoc[] | null = null;
  let profile: Profile | null = null;

  if (isEnvelope) {
    if (Array.isArray(envelope.documents)) {
      docs = envelope.documents
        .filter((entry) => entry && typeof entry === "object")
        .map(normalizeDoc);
    }
    if (envelope.profile && typeof envelope.profile === "object") {
      profile = normalizeProfile(envelope.profile);
    }
  }

  // All parsed cleanly — now persist.
  writeJSON(STORAGE_KEY, apps);
  if (docs) writeJSON(DOCUMENTS_KEY, docs);
  if (profile) writeJSON(PROFILE_KEY, profile);

  return {
    applications: apps.length,
    documents: docs?.length ?? 0,
    profile: profile !== null,
  };
}
