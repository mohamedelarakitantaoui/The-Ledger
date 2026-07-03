/**
 * Core domain types for The Ledger.
 *
 * These types are intentionally framework-agnostic so that the storage layer
 * (and, later, a browser extension) can depend on them without pulling in React.
 */

export type Platform =
  | "ReKrute"
  | "LinkedIn"
  | "Indeed Maroc"
  | "Maroc Emploi IT"
  | "Emploi.ma"
  | "Company site"
  | "ESN/Referral"
  | "Other";

export type Pipeline = "Job (Morocco)" | "Master/Alternance (France)";

export type Status =
  | "Wishlist"
  | "Applied"
  | "Pending"
  | "Interview"
  | "Accepted"
  | "Rejected"
  | "Ghosted";

export interface Application {
  id: string;
  company: string;
  role: string;
  platform: Platform;
  pipeline: Pipeline;
  status: Status;
  /** Free text — Casablanca, Rabat, Tanger, Marrakech, Remote, … */
  city: string;
  /** Optional, free text (currency / range varies by listing). */
  salary?: string;
  /** Optional link back to the original listing. */
  jobUrl?: string;
  /** ISO date string (YYYY-MM-DD). */
  dateApplied: string;
  notes: string;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
}

/**
 * Shape accepted when creating an application. `id`, `createdAt` and
 * `updatedAt` are managed by the storage layer.
 */
export type ApplicationInput = Omit<
  Application,
  "id" | "createdAt" | "updatedAt"
>;

/** Patch shape accepted when editing an application. */
export type ApplicationPatch = Partial<ApplicationInput>;

/** Status filter value for the chip row ("All" shows every status). */
export type StatusFilter = Status | "All";

// ---------------------------------------------------------------------------
// Master profile — the single source of truth for generated documents.
// ---------------------------------------------------------------------------

export interface ContactInfo {
  email: string;
  phone: string;
  city: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

/** Categorised skills. Order within each list is meaningful (most relevant first). */
export interface SkillSet {
  languages: string[];
  frameworks: string[];
  tools: string[];
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string; // free text — "Jan 2024", "2023", …
  end: string; // free text — "Present", "Jun 2025", …
  /** One achievement per line. */
  bullets: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  stack: string;
  description: string;
  outcome: string;
  url: string;
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  location: string;
}

export interface LanguageEntry {
  id: string;
  name: string;
  /** Native, Bilingual, C1, Professional, … */
  level: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface Profile {
  fullName: string;
  title: string;
  contact: ContactInfo;
  summary: string;
  skills: SkillSet;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  languages: LanguageEntry[];
  certifications: CertificationEntry[];
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Generated documents (per application).
// ---------------------------------------------------------------------------

export type DocType = "cv" | "cover-letter" | "intro" | "answers";

export type DocLanguage = "fr" | "en";

export interface GeneratedDoc {
  id: string;
  applicationId: string;
  type: DocType;
  language: DocLanguage;
  title: string;
  /** Markdown body — editable before saving. */
  content: string;
  /** Exactly one doc per (application, type) may be marked final. */
  isFinal: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GeneratedDocInput = Omit<
  GeneratedDoc,
  "id" | "createdAt" | "updatedAt"
>;

/** Envelope used for JSON export / import. */
export interface LedgerExport {
  app: "the-ledger";
  version: 2;
  exportedAt: string;
  applications: Application[];
  profile?: Profile;
  documents?: GeneratedDoc[];
}
