/**
 * ai.ts — the only module that talks to the Anthropic API.
 *
 * Document generation is an *enhancement*: the app works fully without a key
 * (write/edit documents by hand). When `VITE_ANTHROPIC_API_KEY` is present we
 * call the Messages API directly from the browser.
 *
 * ⚠️ Security: Vite inlines `VITE_*` env vars into the client bundle, so the key
 * is visible to anyone with the built files. This is acceptable for a local,
 * personal tool — do NOT deploy this publicly with a real key. For a hosted
 * deployment you'd move generation behind a tiny server proxy that holds the key
 * and exposes the same `generateDocument` shape.
 *
 * Key resolution order:
 *   1. VITE_ANTHROPIC_API_KEY (build-time .env)
 *   2. localStorage "ledger_api_key" (set from the in-app Settings panel)
 *
 * Public API:
 *   isConfigured()                              -> boolean
 *   keySource()                                 -> "env" | "local" | null
 *   getStoredKey() / setStoredKey() / clearStoredKey()
 *   testApiKey(key?)                            -> Promise<void>  (throws with reason)
 *   subscribeKeyChange(listener)                -> unsubscribe
 *   generateDocument(type, profile, job, extra) -> Promise<string>  (markdown)
 */

import type {
  Application,
  DocLanguage,
  DocType,
  Profile,
} from "./types";

const API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
// Current Claude Sonnet (see claude-api reference). Bare id, no date suffix.
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

export interface GenerateExtra {
  language: DocLanguage;
  /**
   * For `answers`: the question(s) to answer (required).
   * For other types: optional extra steering ("emphasise backend", …).
   */
  customPrompt?: string;
}

/** localStorage key holding a user-pasted API key (Settings panel). */
export const API_KEY_STORAGE_KEY = "ledger_api_key";

function readEnvKey(): string | undefined {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
  return typeof key === "string" && key.trim() ? key.trim() : undefined;
}

export function getStoredKey(): string | undefined {
  try {
    const key = window.localStorage.getItem(API_KEY_STORAGE_KEY);
    return key && key.trim() ? key.trim() : undefined;
  } catch {
    return undefined;
  }
}

function readKey(): string | undefined {
  return readEnvKey() ?? getStoredKey();
}

export function isConfigured(): boolean {
  return !!readKey();
}

/** Where the active key comes from — drives the Settings indicator copy. */
export function keySource(): "env" | "local" | null {
  if (readEnvKey()) return "env";
  if (getStoredKey()) return "local";
  return null;
}

// ---------------------------------------------------------------------------
// Key change notifications — so the UI can react when the key is saved/cleared
// ---------------------------------------------------------------------------

type KeyListener = () => void;
const keyListeners = new Set<KeyListener>();

function notifyKeyChange(): void {
  for (const listener of keyListeners) listener();
}

export function subscribeKeyChange(listener: KeyListener): () => void {
  keyListeners.add(listener);
  return () => {
    keyListeners.delete(listener);
  };
}

export function setStoredKey(key: string): void {
  try {
    window.localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } catch {
    throw new Error(
      "Couldn't save the key — browser storage is full or unavailable.",
    );
  }
  notifyKeyChange();
}

export function clearStoredKey(): void {
  try {
    window.localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
  notifyKeyChange();
}

// ---------------------------------------------------------------------------
// Key test — minimal 1-token call to confirm the key actually works
// ---------------------------------------------------------------------------

/**
 * Fire the smallest possible Messages API request. Resolves when the key
 * works; throws with a human-readable reason otherwise.
 */
export async function testApiKey(key?: string): Promise<void> {
  const apiKey = key?.trim() || readKey();
  if (!apiKey) throw new Error("No API key to test.");

  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1,
        messages: [{ role: "user", content: "Hi" }],
      }),
    });
  } catch {
    throw new Error(
      "Couldn't reach the Anthropic API. Check your connection and try again.",
    );
  }
  if (!res.ok) {
    throw new Error(await describeError(res));
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function generateDocument(
  type: DocType,
  profile: Profile,
  job: Application,
  extra: GenerateExtra,
): Promise<string> {
  const apiKey = readKey();
  if (!apiKey) {
    throw new Error(
      "No API key configured. Paste one in Settings (or add VITE_ANTHROPIC_API_KEY to a .env file) to enable AI generation — the app still works without it.",
    );
  }

  const { system, user } = buildPrompt(type, profile, job, extra);

  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        // Required to allow calling the API directly from a browser (CORS).
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
  } catch {
    throw new Error(
      "Couldn't reach the Anthropic API. Check your connection and try again.",
    );
  }

  if (!res.ok) {
    throw new Error(await describeError(res));
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = (data.content ?? [])
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("")
    .trim();

  if (!text) {
    throw new Error("The model returned an empty response. Please try again.");
  }
  return text;
}

async function describeError(res: Response): Promise<string> {
  let detail = "";
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    detail = body?.error?.message ?? "";
  } catch {
    /* ignore */
  }
  switch (res.status) {
    case 401:
      return "Your API key was rejected (401). Double-check the key in Settings (or VITE_ANTHROPIC_API_KEY).";
    case 403:
      return "That API key doesn't have access to this model (403).";
    case 429:
      return "Rate limited (429). Wait a moment and try again.";
    case 500:
    case 529:
      return "Anthropic is busy right now. Try again in a moment.";
    default:
      return detail
        ? `Generation failed (${res.status}): ${detail}`
        : `Generation failed (${res.status}).`;
  }
}

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = [
  "You are an expert career and CV writer who helps junior software developers in Morocco and France craft tailored, ATS-friendly application materials.",
  "Output clean Markdown only — no preamble, no sign-off about being an AI, no explanations, and never wrap the whole document in a code fence.",
  "Use ONLY the facts in the candidate profile. Never invent employers, dates, degrees, or skills.",
  "Tailor wording to the target role and reorder skills and bullet points so the most relevant ones come first.",
  "Keep everything ATS-safe: a single column, standard section headings, simple Markdown bullet lists, no tables, no multi-column layouts, no images, and no characters used purely for visual layout.",
].join(" ");

function buildPrompt(
  type: DocType,
  profile: Profile,
  job: Application,
  extra: GenerateExtra,
): { system: string; user: string } {
  const langLine =
    extra.language === "fr"
      ? "Write the entire output in French (français), using natural professional French."
      : "Write the entire output in English.";

  const steering = extra.customPrompt?.trim();

  const sections: string[] = [
    "## TARGET ROLE",
    jobToText(job),
    "",
    "## CANDIDATE PROFILE",
    profileToText(profile),
    "",
    "## TASK",
    taskInstruction(type, job, steering),
    "",
    langLine,
  ];

  return { system: SYSTEM_PROMPT, user: sections.join("\n") };
}

function taskInstruction(
  type: DocType,
  job: Application,
  steering: string | undefined,
): string {
  const company = job.company || "the company";
  const role = job.role || "the role";
  let base: string;

  switch (type) {
    case "cv":
      base = [
        "Write a complete, tailored CV in Markdown for this role.",
        "Start with an H1 of the candidate's full name, then a line with their title, then a line with their contact details (only those provided).",
        "Then include, omitting any empty section: a short professional Summary tailored to the role; a Skills section grouped as Languages / Frameworks / Tools with the most role-relevant items first; Experience (company, role, location, dates, achievement bullets); Projects (with stack and outcome); Education; Languages; and Certifications.",
        "Keep it concise — ideally one to two pages of text.",
      ].join(" ");
      break;
    case "cover-letter":
      base = [
        `Write a tailored cover letter in Markdown addressed to the hiring team at ${company} for the ${role} position.`,
        "Three to four short paragraphs, roughly 250–350 words: open with genuine, specific interest; connect two or three of the most relevant experiences, projects, or skills to the role; and close with a brief call to action.",
      ].join(" ");
      break;
    case "intro":
      base = [
        `Write a short, friendly-but-professional introduction message (4–6 sentences) the candidate can send on LinkedIn or by email to a recruiter for the ${role} role at ${company}.`,
        "Warm and concise; mention the single most relevant strength and express clear interest. No subject line unless it reads naturally.",
      ].join(" ");
      break;
    case "answers":
      base = [
        "Answer the following application question(s) on behalf of the candidate, using their profile and the role context.",
        "Be specific, honest, and concise. Use Markdown, with a short, clearly separated answer per question.",
        "\n\nQUESTION(S):",
        steering || "(No question provided — ask the candidate to add one.)",
      ].join(" ");
      // Steering is the question itself for this type; don't append it again.
      return base;
  }

  if (steering) {
    base += `\n\nAdditional instructions from the candidate: ${steering}`;
  }
  return base;
}

function jobToText(job: Application): string {
  const lines = [
    `Company: ${job.company}`,
    `Role: ${job.role}`,
    `Pipeline: ${job.pipeline}`,
    `Platform: ${job.platform}`,
    job.city ? `City: ${job.city}` : "",
    job.salary ? `Salary: ${job.salary}` : "",
    job.jobUrl ? `Job URL: ${job.jobUrl}` : "",
    "",
    "Notes / job description:",
    job.notes.trim() || "(none provided)",
  ];
  return lines.filter((l) => l !== "").join("\n");
}

function profileToText(p: Profile): string {
  const out: string[] = [];

  out.push(`Name: ${p.fullName || "(not set)"}`);
  if (p.title) out.push(`Title: ${p.title}`);

  const contact = [
    p.contact.email && `Email: ${p.contact.email}`,
    p.contact.phone && `Phone: ${p.contact.phone}`,
    p.contact.city && `City: ${p.contact.city}`,
    p.contact.linkedin && `LinkedIn: ${p.contact.linkedin}`,
    p.contact.github && `GitHub: ${p.contact.github}`,
    p.contact.portfolio && `Portfolio: ${p.contact.portfolio}`,
  ].filter(Boolean);
  if (contact.length) out.push(contact.join(" · "));

  if (p.summary) out.push(`\nSummary: ${p.summary}`);

  const skills = [
    p.skills.languages.length && `Languages: ${p.skills.languages.join(", ")}`,
    p.skills.frameworks.length &&
      `Frameworks: ${p.skills.frameworks.join(", ")}`,
    p.skills.tools.length && `Tools: ${p.skills.tools.join(", ")}`,
  ].filter(Boolean);
  if (skills.length) out.push(`\nSkills:\n${skills.join("\n")}`);

  if (p.experience.length) {
    out.push("\nExperience:");
    for (const e of p.experience) {
      out.push(
        `- ${e.role || "Role"} at ${e.company || "Company"}${
          e.location ? `, ${e.location}` : ""
        } (${[e.start, e.end].filter(Boolean).join(" – ") || "dates n/a"})`,
      );
      const bullets = e.bullets
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean);
      for (const b of bullets) out.push(`    • ${b}`);
    }
  }

  if (p.projects.length) {
    out.push("\nProjects:");
    for (const pr of p.projects) {
      out.push(
        `- ${pr.name || "Project"}${pr.stack ? ` (${pr.stack})` : ""}: ${
          pr.description
        }${pr.outcome ? ` Outcome: ${pr.outcome}` : ""}${
          pr.url ? ` [${pr.url}]` : ""
        }`,
      );
    }
  }

  if (p.education.length) {
    out.push("\nEducation:");
    for (const ed of p.education) {
      out.push(
        `- ${ed.degree || "Degree"}${ed.field ? `, ${ed.field}` : ""} — ${
          ed.school || "School"
        }${ed.location ? `, ${ed.location}` : ""} (${
          [ed.start, ed.end].filter(Boolean).join(" – ") || "dates n/a"
        })`,
      );
    }
  }

  if (p.languages.length) {
    out.push(
      `\nLanguages: ${p.languages
        .map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`)
        .join(", ")}`,
    );
  }

  if (p.certifications.length) {
    out.push(
      `\nCertifications: ${p.certifications
        .map(
          (c) =>
            `${c.name}${c.issuer ? ` — ${c.issuer}` : ""}${
              c.year ? ` (${c.year})` : ""
            }`,
        )
        .join(", ")}`,
    );
  }

  return out.join("\n");
}
