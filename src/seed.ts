import type { Application, GeneratedDoc, Profile } from "./types";

/**
 * Seed data for The Ledger — Mamoun's real profile and application hunt.
 *
 * Written only once, when the corresponding localStorage key is still empty
 * (see storage.ts). Ids and timestamps are fixed so the seed is deterministic.
 *
 * PLACEHOLDERS to edit in-app (never fabricated):
 *   - `dateApplied` is set to the seed date below for every entry — replace with
 *     the real submission date. For the two not-yet-applied leads it just marks
 *     when the row was created.
 *   - `platform` values are best-guess (the source data didn't record where each
 *     listing came from) — correct them in the edit modal.
 *   - Cities for Phi Partners / Leyton / Oracle / Smile / Saham are best-guess.
 */

/** Date the ledger was seeded — a clearly-marked placeholder, not a real submit date. */
const SEED_DATE = "2026-07-07";
const SEED_TS = "2026-07-07T00:00:00.000Z";

export function seedApplications(): Application[] {
  return [
    {
      id: "seed-dell-ips",
      company: "Dell Technologies",
      role: "Inside Product Specialist",
      platform: "Company site",
      pipeline: "Job (Morocco)",
      status: "Interview",
      city: "Casablanca",
      dateApplied: SEED_DATE,
      notes:
        "Furthest along — interview / assessment stage. Recruiter: Ghita (HR).\n" +
        "Business-case presentation due July 12: a 15-min deck explaining AI in " +
        "simple terms using Dell AI Factory / PowerEdge / PowerScale / PowerProtect.\n" +
        "[placeholder] platform + applied-date are guesses — edit.",
      createdAt: SEED_TS,
      updatedAt: SEED_TS,
    },
    {
      id: "seed-intelcia-swe",
      company: "Intelcia Solutions",
      role: "Software Engineer",
      platform: "ESN/Referral",
      pipeline: "Job (Morocco)",
      status: "Applied",
      city: "Rabat",
      dateApplied: SEED_DATE,
      notes:
        "Former intern here — warm connection.\n" +
        "CV used: CV_Intelcia_Software_Engineer.tex.\n" +
        "[placeholder] applied-date is a guess — edit.",
      createdAt: SEED_TS,
      updatedAt: SEED_TS,
    },
    {
      id: "seed-phi-quant",
      company: "Phi Partners",
      role: "Quant Developer",
      platform: "Company site",
      pipeline: "Job (Morocco)",
      status: "Applied",
      city: "Casablanca",
      dateApplied: SEED_DATE,
      notes:
        "CV used: CV_PhiPartners_Quant_Developer.tex.\n" +
        "[placeholder] city + platform + applied-date are guesses — edit.",
      createdAt: SEED_TS,
      updatedAt: SEED_TS,
    },
    {
      id: "seed-leyton-ai",
      company: "Leyton CognitX",
      role: "AI Engineer",
      platform: "Company site",
      pipeline: "Job (Morocco)",
      status: "Applied",
      city: "Casablanca",
      dateApplied: SEED_DATE,
      notes:
        "CV used: CV_LeytonCognitX_AI_Engineer.tex.\n" +
        "[placeholder] city + platform + applied-date are guesses — edit.",
      createdAt: SEED_TS,
      updatedAt: SEED_TS,
    },
    {
      id: "seed-oracle-pfe",
      company: "Oracle Morocco",
      role: "R&D PFE (internship / thesis)",
      platform: "Company site",
      pipeline: "Job (Morocco)",
      status: "Applied",
      city: "Casablanca",
      dateApplied: SEED_DATE,
      notes:
        "Final-year project (PFE) — internship / thesis track.\n" +
        "CV used: CV_Oracle_Morocco_RnD_PFE.tex.\n" +
        "[placeholder] city + platform + applied-date are guesses — edit.",
      createdAt: SEED_TS,
      updatedAt: SEED_TS,
    },
    {
      id: "seed-smile-odoo",
      // Not yet applied — mapped to Wishlist (no "Draft" status exists).
      company: "Smile",
      role: "Odoo Developer",
      platform: "Company site",
      pipeline: "Job (Morocco)",
      status: "Wishlist",
      city: "Casablanca",
      dateApplied: SEED_DATE,
      notes:
        "DRAFT — not yet applied. Tailored Smile Odoo CV started, not finished.\n" +
        "Mapped to Wishlist (the model has no 'Draft' status).\n" +
        "[placeholder] city + platform are guesses; date is the row-created date, " +
        "not a submission — edit once applied.",
      createdAt: SEED_TS,
      updatedAt: SEED_TS,
    },
    {
      id: "seed-saham-ai",
      // Lead — want to apply — mapped to Wishlist.
      company: "Saham Bank",
      role: "AI Engineer",
      platform: "LinkedIn",
      pipeline: "Job (Morocco)",
      status: "Wishlist",
      city: "Casablanca",
      dateApplied: SEED_DATE,
      notes:
        "LEAD — want to apply. Original posting was removed before I could apply.\n" +
        "Plan: reach out to the HR contact directly via LinkedIn.\n" +
        "Mapped to Wishlist. [placeholder] city + platform are guesses; date is the " +
        "row-created date, not a submission — edit once applied.",
      createdAt: SEED_TS,
      updatedAt: SEED_TS,
    },
  ];
}

/** A blank, well-formed profile (used before the user fills theirs in). */
export function emptyProfile(): Profile {
  return {
    fullName: "",
    title: "",
    contact: {
      email: "",
      phone: "",
      city: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    summary: "",
    skills: { languages: [], frameworks: [], tools: [] },
    experience: [],
    projects: [],
    education: [],
    languages: [],
    certifications: [],
    updatedAt: new Date().toISOString(),
  };
}

/** Mamoun's master profile — the source of truth for generated documents. */
export function seedProfile(): Profile {
  return {
    fullName: "Mohamed El Araki Tantaoui (Mamoun)",
    title:
      "Final-year Computer Science student — Al Akhawayn University, Ifrane (graduating May 2026)",
    contact: {
      // Left empty on purpose — fill these in-app.
      email: "",
      phone: "",
      city: "Ifrane, Morocco",
      linkedin: "",
      github: "github.com/mohamedelarakitantaoui",
      portfolio: "",
    },
    summary:
      "Final-year Computer Science student at Al Akhawayn University (Ifrane), " +
      "graduating May 2026. Targeting software / AI engineering roles in Casablanca " +
      "and Rabat, with a longer-horizon track toward a master's + alternance in " +
      "France (~Sept 2027). Comfortable across React / TypeScript front ends and " +
      "Python / FastAPI back ends, with hands-on work in LLM APIs, RAG, vector " +
      "databases and agentic workflows.",
    skills: {
      languages: ["TypeScript", "Python", "Java", "SQL"],
      frameworks: ["React", "Node.js", "FastAPI", "PyTorch"],
      tools: [
        "LLM APIs (Anthropic / OpenAI)",
        "RAG",
        "Vector databases",
        "Agentic workflows",
        "Git",
      ],
    },
    experience: [
      {
        id: "seed-exp-intelcia",
        company: "Intelcia Solutions",
        role: "Software Engineer Intern",
        location: "Rabat, Morocco",
        start: "", // dates unknown — fill in-app
        end: "",
        bullets:
          "Refactored a large monolith into modular services, delivering major performance gains.",
      },
      {
        id: "seed-exp-elaraki",
        company: "ITS Elaraki School",
        role: "Web Applications Intern",
        location: "",
        start: "",
        end: "",
        bullets: "Built and maintained internal web applications.",
      },
    ],
    projects: [
      {
        id: "seed-proj-aneuxplain",
        name: "AneuXplain",
        stack: "FastAPI, React, PyTorch",
        description:
          "Explainable ML pipeline for aneurysm rupture-risk prediction (FastAPI backend + React frontend).",
        outcome: "",
        url: "",
      },
      {
        id: "seed-proj-ledger",
        name: "The Ledger",
        stack: "React, TypeScript, Vite, Tailwind, Anthropic API",
        description:
          "This app — a self-hosted job-application tracker with AI document generation via the Anthropic API.",
        outcome: "",
        url: "",
      },
    ],
    education: [
      {
        id: "seed-edu-aui",
        school: "Al Akhawayn University",
        degree: "BSc Computer Science",
        field: "Computer Science",
        start: "",
        end: "May 2026 (expected)",
        location: "Ifrane, Morocco",
      },
      {
        id: "seed-edu-bogazici",
        school: "Boğaziçi University",
        degree: "Exchange semester",
        field: "Computer Science",
        start: "",
        end: "",
        location: "Istanbul, Turkey",
      },
    ],
    languages: [
      { id: "seed-lang-ar", name: "Arabic", level: "Native" },
      { id: "seed-lang-fr", name: "French", level: "Fluent" },
      { id: "seed-lang-en", name: "English", level: "Fluent" },
    ],
    certifications: [],
    updatedAt: SEED_TS,
  };
}

/**
 * CV records for the applications that had one. The document model stores
 * Markdown text (there is no file-attachment field), so each record is a
 * clearly-marked placeholder pointing at the real source file — paste the CV
 * text in, or use AI generation to draft a tailored version.
 *
 * The Smile CV is an in-progress draft — left NOT final. Saham Bank had no CV.
 */
export function seedDocuments(): GeneratedDoc[] {
  const cv = (
    applicationId: string,
    id: string,
    title: string,
    sourceFile: string,
    isFinal: boolean,
    extra = "",
  ): GeneratedDoc => ({
    id,
    applicationId,
    type: "cv",
    language: "en",
    title,
    content:
      `> Placeholder CV record — no source file lives inside the app.\n` +
      `> Real source: \`${sourceFile}\`. Paste the CV text below, or use AI ` +
      `generation to draft a tailored version.${extra ? `\n>\n> ${extra}` : ""}\n`,
    isFinal,
    createdAt: SEED_TS,
    updatedAt: SEED_TS,
  });

  return [
    cv(
      "seed-dell-ips",
      "seed-doc-dell-cv",
      "CV — Dell Inside Product Specialist (tailored)",
      "CV_Dell_InsideProductSpecialist.tex",
      true,
      "No filename was recorded — this was a tailored CV.",
    ),
    cv(
      "seed-intelcia-swe",
      "seed-doc-intelcia-cv",
      "CV — Intelcia Software Engineer",
      "CV_Intelcia_Software_Engineer.tex",
      true,
    ),
    cv(
      "seed-phi-quant",
      "seed-doc-phi-cv",
      "CV — Phi Partners Quant Developer",
      "CV_PhiPartners_Quant_Developer.tex",
      true,
    ),
    cv(
      "seed-leyton-ai",
      "seed-doc-leyton-cv",
      "CV — Leyton CognitX AI Engineer",
      "CV_LeytonCognitX_AI_Engineer.tex",
      true,
    ),
    cv(
      "seed-oracle-pfe",
      "seed-doc-oracle-cv",
      "CV — Oracle Morocco R&D PFE",
      "CV_Oracle_Morocco_RnD_PFE.tex",
      true,
    ),
    cv(
      "seed-smile-odoo",
      "seed-doc-smile-cv",
      "CV — Smile Odoo Developer (draft, in progress)",
      "CV_Smile_Odoo_Developer.tex",
      false, // draft — not final
      "DRAFT — tailored CV started, not finished.",
    ),
  ];
}
