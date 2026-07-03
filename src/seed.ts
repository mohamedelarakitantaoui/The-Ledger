import type { Application, Profile } from "./types";

/**
 * Two example applications so the UI isn't empty on first launch.
 * Written only once — when no ledger exists in localStorage yet.
 *
 * Ids and timestamps are fixed so the seed is deterministic and easy to
 * recognise (and remove) later.
 */
export function seedApplications(): Application[] {
  return [
    {
      id: "seed-oncf-backend",
      company: "ONCF Digital",
      role: "Junior Backend Developer",
      platform: "ReKrute",
      pipeline: "Job (Morocco)",
      status: "Interview",
      city: "Rabat",
      salary: "9 000 – 12 000 MAD",
      jobUrl: "https://www.rekrute.com/",
      dateApplied: "2026-05-21",
      notes:
        "Spring Boot + PostgreSQL stack. Recruiter call went well — technical round scheduled. Mentioned my final-year project.",
      createdAt: "2026-05-21T09:12:00.000Z",
      updatedAt: "2026-05-30T16:40:00.000Z",
    },
    {
      id: "seed-capgemini-alt",
      company: "Capgemini Engineering",
      role: "Alternance — Software Engineer (M2)",
      platform: "LinkedIn",
      pipeline: "Master/Alternance (France)",
      status: "Applied",
      city: "Toulouse",
      salary: "",
      jobUrl: "https://www.linkedin.com/jobs/",
      dateApplied: "2026-06-02",
      notes:
        "Alternance rythme 3 semaines / 1 semaine. Need to follow up with the school for the convention de stage.",
      createdAt: "2026-06-02T11:05:00.000Z",
      updatedAt: "2026-06-02T11:05:00.000Z",
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

/**
 * An example profile so the Profile page and document generation have something
 * to work with on first run. Clearly placeholder content — overwrite with your
 * own. Mirrors the Morocco-junior-dev context of the seeded applications.
 */
export function seedProfile(): Profile {
  return {
    fullName: "Yassine Benali",
    title: "Junior Software Developer",
    contact: {
      email: "yassine.benali@example.com",
      phone: "+212 6 00 00 00 00",
      city: "Casablanca, Morocco",
      linkedin: "linkedin.com/in/example",
      github: "github.com/example",
      portfolio: "",
    },
    summary:
      "Junior software developer with a strong foundation in backend development and a freshly completed engineering degree. Comfortable across the Java/Spring and JavaScript ecosystems, eager to ship reliable software and grow on a product team.",
    skills: {
      languages: ["Java", "JavaScript", "TypeScript", "SQL", "Python"],
      frameworks: ["Spring Boot", "React", "Node.js", "Express"],
      tools: ["Git", "Docker", "PostgreSQL", "Linux", "Postman"],
    },
    experience: [
      {
        id: "seed-exp-intern",
        company: "Atlas Software (internship)",
        role: "Software Engineering Intern",
        location: "Casablanca",
        start: "Feb 2025",
        end: "Aug 2025",
        bullets:
          "Built REST endpoints in Spring Boot for an internal HR tool used by ~200 employees.\nWrote integration tests that raised coverage of the billing module from 40% to 80%.\nCollaborated in a 5-person Agile team with weekly demos.",
      },
    ],
    projects: [
      {
        id: "seed-proj-ledger",
        name: "The Ledger",
        stack: "React, TypeScript, Vite, Tailwind",
        description:
          "A local-first job application tracker with dashboard stats and JSON backup.",
        outcome: "Used daily to manage 30+ applications across two pipelines.",
        url: "github.com/example/the-ledger",
      },
    ],
    education: [
      {
        id: "seed-edu-eng",
        school: "École Nationale Supérieure d'Informatique",
        degree: "Engineering degree (Bac+5)",
        field: "Software Engineering",
        start: "2020",
        end: "2025",
        location: "Morocco",
      },
    ],
    languages: [
      { id: "seed-lang-ar", name: "Arabic", level: "Native" },
      { id: "seed-lang-fr", name: "French", level: "Fluent (C1)" },
      { id: "seed-lang-en", name: "English", level: "Professional (B2)" },
    ],
    certifications: [],
    updatedAt: "2026-06-02T11:05:00.000Z",
  };
}
