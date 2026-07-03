import { useEffect, useState } from "react";
import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  Profile,
  ProjectEntry,
} from "../types";
import { generateId } from "../utils/format";
import { Labeled, TagInput, TextArea, TextInput } from "./ui";

interface Props {
  profile: Profile;
  onSave: (profile: Profile) => void;
}

export function ProfilePage({ profile, onSave }: Props) {
  const [draft, setDraft] = useState<Profile>(profile);
  const [dirty, setDirty] = useState(false);

  // Re-sync if the stored profile changes externally (import, save, other tab).
  useEffect(() => {
    setDraft(profile);
    setDirty(false);
  }, [profile.updatedAt]);

  function set(patch: Partial<Profile>) {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  }
  const setContact = (patch: Partial<Profile["contact"]>) =>
    set({ contact: { ...draft.contact, ...patch } });
  const setSkills = (patch: Partial<Profile["skills"]>) =>
    set({ skills: { ...draft.skills, ...patch } });

  return (
    <div className="animate-rise flex flex-col gap-12 pb-32">
      <header className="flex flex-col gap-1.5 border-b border-line pb-8 pt-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-faint">
          Single source of truth for every document
        </span>
        <h2 className="font-serif text-4xl font-light text-ink sm:text-5xl">
          My Profile
        </h2>
      </header>

      {/* Identity & contact */}
      <Section
        title="Identity"
        blurb="Your name, headline, and how recruiters reach you."
      >
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          <Labeled label="Full name">
            <TextInput
              value={draft.fullName}
              onChange={(e) => set({ fullName: e.target.value })}
              placeholder="e.g. Yassine Benali"
            />
          </Labeled>
          <Labeled label="Title">
            <TextInput
              value={draft.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="e.g. Junior Software Developer"
            />
          </Labeled>
          <Labeled label="Email">
            <TextInput
              type="email"
              value={draft.contact.email}
              onChange={(e) => setContact({ email: e.target.value })}
              placeholder="you@example.com"
            />
          </Labeled>
          <Labeled label="Phone">
            <TextInput
              value={draft.contact.phone}
              onChange={(e) => setContact({ phone: e.target.value })}
              placeholder="+212 …"
            />
          </Labeled>
          <Labeled label="City">
            <TextInput
              value={draft.contact.city}
              onChange={(e) => setContact({ city: e.target.value })}
              placeholder="Casablanca, Morocco"
            />
          </Labeled>
          <Labeled label="LinkedIn">
            <TextInput
              value={draft.contact.linkedin}
              onChange={(e) => setContact({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/…"
            />
          </Labeled>
          <Labeled label="GitHub">
            <TextInput
              value={draft.contact.github}
              onChange={(e) => setContact({ github: e.target.value })}
              placeholder="github.com/…"
            />
          </Labeled>
          <Labeled label="Portfolio">
            <TextInput
              value={draft.contact.portfolio}
              onChange={(e) => setContact({ portfolio: e.target.value })}
              placeholder="yoursite.com"
            />
          </Labeled>
        </div>
      </Section>

      {/* Summary */}
      <Section title="Summary" blurb="A short pitch. The model tailors it per role.">
        <Labeled label="Professional summary">
          <TextArea
            rows={4}
            value={draft.summary}
            onChange={(e) => set({ summary: e.target.value })}
            placeholder="Two or three sentences about who you are and what you're after."
          />
        </Labeled>
      </Section>

      {/* Skills */}
      <Section
        title="Skills"
        blurb="Add the most important first — the model keeps relevant ones up top."
      >
        <div className="flex flex-col gap-5">
          <Labeled label="Languages">
            <TagInput
              values={draft.skills.languages}
              onChange={(v) => setSkills({ languages: v })}
              placeholder="Java, TypeScript, SQL…"
            />
          </Labeled>
          <Labeled label="Frameworks">
            <TagInput
              values={draft.skills.frameworks}
              onChange={(v) => setSkills({ frameworks: v })}
              placeholder="Spring Boot, React, Node…"
            />
          </Labeled>
          <Labeled label="Tools">
            <TagInput
              values={draft.skills.tools}
              onChange={(v) => setSkills({ tools: v })}
              placeholder="Git, Docker, PostgreSQL…"
            />
          </Labeled>
        </div>
      </Section>

      {/* Experience */}
      <Section
        title="Experience"
        blurb="Roles and internships. One achievement per line in the bullets box."
        onAdd={() =>
          set({
            experience: [
              ...draft.experience,
              {
                id: generateId(),
                company: "",
                role: "",
                location: "",
                start: "",
                end: "",
                bullets: "",
              },
            ],
          })
        }
        empty={draft.experience.length === 0}
      >
        {draft.experience.map((e) => (
          <Card
            key={e.id}
            onRemove={() =>
              set({
                experience: draft.experience.filter((x) => x.id !== e.id),
              })
            }
          >
            <EntryFields<ExperienceEntry>
              entry={e}
              onChange={(patch) =>
                set({
                  experience: draft.experience.map((x) =>
                    x.id === e.id ? { ...x, ...patch } : x,
                  ),
                })
              }
              fields={[
                { key: "role", label: "Role", col: 1 },
                { key: "company", label: "Company", col: 1 },
                { key: "location", label: "Location", col: 1 },
                { key: "start", label: "Start", col: 2 },
                { key: "end", label: "End", col: 2 },
              ]}
            />
            <Labeled label="Achievements" hint="one per line">
              <TextArea
                rows={3}
                value={e.bullets}
                onChange={(ev) =>
                  set({
                    experience: draft.experience.map((x) =>
                      x.id === e.id ? { ...x, bullets: ev.target.value } : x,
                    ),
                  })
                }
                placeholder={"Built X using Y, improving Z by N%.\n…"}
              />
            </Labeled>
          </Card>
        ))}
      </Section>

      {/* Projects */}
      <Section
        title="Projects"
        blurb="Side or academic projects — stack and outcome help a lot."
        onAdd={() =>
          set({
            projects: [
              ...draft.projects,
              {
                id: generateId(),
                name: "",
                stack: "",
                description: "",
                outcome: "",
                url: "",
              },
            ],
          })
        }
        empty={draft.projects.length === 0}
      >
        {draft.projects.map((p) => (
          <Card
            key={p.id}
            onRemove={() =>
              set({ projects: draft.projects.filter((x) => x.id !== p.id) })
            }
          >
            <EntryFields<ProjectEntry>
              entry={p}
              onChange={(patch) =>
                set({
                  projects: draft.projects.map((x) =>
                    x.id === p.id ? { ...x, ...patch } : x,
                  ),
                })
              }
              fields={[
                { key: "name", label: "Name", col: 1 },
                { key: "stack", label: "Stack", col: 1 },
                { key: "url", label: "URL", col: 1 },
              ]}
            />
            <Labeled label="Description">
              <TextArea
                rows={2}
                value={p.description}
                onChange={(ev) =>
                  set({
                    projects: draft.projects.map((x) =>
                      x.id === p.id
                        ? { ...x, description: ev.target.value }
                        : x,
                    ),
                  })
                }
              />
            </Labeled>
            <Labeled label="Outcome">
              <TextInput
                value={p.outcome}
                onChange={(ev) =>
                  set({
                    projects: draft.projects.map((x) =>
                      x.id === p.id ? { ...x, outcome: ev.target.value } : x,
                    ),
                  })
                }
                placeholder="What it achieved / impact"
              />
            </Labeled>
          </Card>
        ))}
      </Section>

      {/* Education */}
      <Section
        title="Education"
        blurb="Degrees and schools."
        onAdd={() =>
          set({
            education: [
              ...draft.education,
              {
                id: generateId(),
                school: "",
                degree: "",
                field: "",
                start: "",
                end: "",
                location: "",
              },
            ],
          })
        }
        empty={draft.education.length === 0}
      >
        {draft.education.map((ed) => (
          <Card
            key={ed.id}
            onRemove={() =>
              set({ education: draft.education.filter((x) => x.id !== ed.id) })
            }
          >
            <EntryFields<EducationEntry>
              entry={ed}
              onChange={(patch) =>
                set({
                  education: draft.education.map((x) =>
                    x.id === ed.id ? { ...x, ...patch } : x,
                  ),
                })
              }
              fields={[
                { key: "degree", label: "Degree", col: 1 },
                { key: "field", label: "Field", col: 1 },
                { key: "school", label: "School", col: 1 },
                { key: "location", label: "Location", col: 1 },
                { key: "start", label: "Start", col: 2 },
                { key: "end", label: "End", col: 2 },
              ]}
            />
          </Card>
        ))}
      </Section>

      {/* Languages */}
      <Section
        title="Languages"
        blurb="Spoken languages and your level."
        onAdd={() =>
          set({
            languages: [
              ...draft.languages,
              { id: generateId(), name: "", level: "" },
            ],
          })
        }
        empty={draft.languages.length === 0}
      >
        {draft.languages.map((l) => (
          <Card
            key={l.id}
            onRemove={() =>
              set({ languages: draft.languages.filter((x) => x.id !== l.id) })
            }
          >
            <EntryFields<LanguageEntry>
              entry={l}
              onChange={(patch) =>
                set({
                  languages: draft.languages.map((x) =>
                    x.id === l.id ? { ...x, ...patch } : x,
                  ),
                })
              }
              fields={[
                { key: "name", label: "Language", col: 2 },
                { key: "level", label: "Level", col: 2 },
              ]}
            />
          </Card>
        ))}
      </Section>

      {/* Certifications */}
      <Section
        title="Certifications"
        blurb="Optional — certificates and the year you earned them."
        onAdd={() =>
          set({
            certifications: [
              ...draft.certifications,
              { id: generateId(), name: "", issuer: "", year: "" },
            ],
          })
        }
        empty={draft.certifications.length === 0}
      >
        {draft.certifications.map((c) => (
          <Card
            key={c.id}
            onRemove={() =>
              set({
                certifications: draft.certifications.filter(
                  (x) => x.id !== c.id,
                ),
              })
            }
          >
            <EntryFields<CertificationEntry>
              entry={c}
              onChange={(patch) =>
                set({
                  certifications: draft.certifications.map((x) =>
                    x.id === c.id ? { ...x, ...patch } : x,
                  ),
                })
              }
              fields={[
                { key: "name", label: "Name", col: 1 },
                { key: "issuer", label: "Issuer", col: 2 },
                { key: "year", label: "Year", col: 2 },
              ]}
            />
          </Card>
        ))}
      </Section>

      {/* Sticky save bar */}
      {dirty ? (
        <div className="animate-rise fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-line bg-elevated/95 py-2.5 pl-5 pr-2.5 shadow-2xl backdrop-blur">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Unsaved changes
            </span>
            <button
              onClick={() => {
                setDraft(profile);
                setDirty(false);
              }}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              Discard
            </button>
            <button
              onClick={() => onSave(draft)}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-canvas transition-all duration-300 ease-weighty hover:brightness-110 active:scale-[0.98]"
            >
              Save profile
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

interface SectionProps {
  title: string;
  blurb: string;
  onAdd?: () => void;
  empty?: boolean;
  children: React.ReactNode;
}

function Section({ title, blurb, onAdd, empty, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-serif text-2xl font-light text-ink">{title}</h3>
          <p className="text-sm text-muted">{blurb}</p>
        </div>
        {onAdd ? (
          <button
            onClick={onAdd}
            className="shrink-0 rounded-full border border-line px-3.5 py-2 font-mono text-[10px] uppercase tracking-wider text-ink transition-colors hover:border-accent/40 hover:text-accent-ink"
          >
            + Add
          </button>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
      {onAdd && empty ? (
        <p className="text-sm italic text-faint">Nothing added yet.</p>
      ) : null}
    </section>
  );
}

function Card({
  onRemove,
  children,
}: {
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border border-line bg-surface/40 p-5">
      <button
        onClick={onRemove}
        aria-label="Remove"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-faint transition-colors hover:bg-elevated hover:text-[#B5604F]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
        </svg>
      </button>
      {children}
    </div>
  );
}

/** Renders a small grid of single-line text fields for a string-keyed entry. */
function EntryFields<T extends { id: string }>({
  entry,
  onChange,
  fields,
}: {
  entry: T;
  onChange: (patch: Partial<T>) => void;
  fields: { key: keyof T & string; label: string; col: 1 | 2 }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 pr-8">
      {fields.map((f) => (
        <Labeled
          key={f.key}
          label={f.label}
          className={f.col === 1 ? "col-span-2 sm:col-span-1" : "col-span-1"}
        >
          <TextInput
            value={String(entry[f.key] ?? "")}
            onChange={(e) =>
              onChange({ [f.key]: e.target.value } as unknown as Partial<T>)
            }
          />
        </Labeled>
      ))}
    </div>
  );
}
