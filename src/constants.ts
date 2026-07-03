import type { DocType, Platform, Pipeline, Status } from "./types";

export const PLATFORMS: Platform[] = [
  "ReKrute",
  "LinkedIn",
  "Indeed Maroc",
  "Maroc Emploi IT",
  "Emploi.ma",
  "Company site",
  "ESN/Referral",
  "Other",
];

export const PIPELINES: Pipeline[] = [
  "Job (Morocco)",
  "Master/Alternance (France)",
];

export const DEFAULT_PIPELINE: Pipeline = "Job (Morocco)";

export const STATUSES: Status[] = [
  "Wishlist",
  "Applied",
  "Pending",
  "Interview",
  "Accepted",
  "Rejected",
  "Ghosted",
];

/**
 * Status presentation. Colour is carried by a single small dot so the palette
 * stays quiet — off-white text, near-black surfaces, warm accent used sparingly.
 */
export const STATUS_META: Record<Status, { label: string; color: string }> = {
  Wishlist: { label: "Wishlist", color: "#7C7A6E" },
  Applied: { label: "Applied", color: "#6E8FB8" },
  Pending: { label: "Pending", color: "#C9A24B" },
  Interview: { label: "Interview", color: "#FF5B2E" },
  Accepted: { label: "Accepted", color: "#5FA37A" },
  Rejected: { label: "Rejected", color: "#B5604F" },
  Ghosted: { label: "Ghosted", color: "#6A6A78" },
};

/** Statuses that count as "in the running" for the dashboard. */
export const IN_RUNNING_STATUSES: Status[] = ["Applied", "Pending", "Interview"];

// ---------------------------------------------------------------------------
// Document generation
// ---------------------------------------------------------------------------

export const DOC_TYPES: DocType[] = ["cv", "cover-letter", "intro", "answers"];

export const DOC_TYPE_META: Record<
  DocType,
  {
    label: string;
    short: string;
    blurb: string;
    /** CV / cover / intro are language-toggleable; answers follow the question. */
    hasLanguage: boolean;
    /** answers needs the question(s); others accept optional extra steering. */
    promptLabel: string;
    promptRequired: boolean;
  }
> = {
  cv: {
    label: "Tailored CV",
    short: "CV",
    blurb: "A one-column, ATS-friendly CV reordered to match this role.",
    hasLanguage: true,
    promptLabel: "Extra steering (optional)",
    promptRequired: false,
  },
  "cover-letter": {
    label: "Cover letter",
    short: "Letter",
    blurb: "A short letter connecting your profile to this company and role.",
    hasLanguage: true,
    promptLabel: "Extra steering (optional)",
    promptRequired: false,
  },
  intro: {
    label: "Intro message",
    short: "Intro",
    blurb: "A brief LinkedIn / email note to a recruiter.",
    hasLanguage: true,
    promptLabel: "Extra steering (optional)",
    promptRequired: false,
  },
  answers: {
    label: "Application Q&A",
    short: "Q&A",
    blurb: "Answers to the questions a form or recruiter is asking.",
    hasLanguage: true,
    promptLabel: "Question(s) to answer",
    promptRequired: true,
  },
};

/** Shorthand abbreviations for platforms, used in tight row layouts. */
export const PLATFORM_SHORT: Record<Platform, string> = {
  ReKrute: "ReKrute",
  LinkedIn: "LinkedIn",
  "Indeed Maroc": "Indeed",
  "Maroc Emploi IT": "Emploi IT",
  "Emploi.ma": "Emploi.ma",
  "Company site": "Company",
  "ESN/Referral": "ESN/Ref",
  Other: "Other",
};
