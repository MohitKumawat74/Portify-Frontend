import Image from 'next/image';
import type { Portfolio, Skill, Project, Experience as ExpType } from '@/types';
import { Button } from '@/components/ui/Button';

/** Template 2 — Dark / Creative (charcoal background, purple accents) */
export function Template2({ portfolio }: { portfolio: Portfolio }) {
  const { sections } = portfolio;

  function getSectionData<T>(type: string): T | null {
    const s = sections.find((s) => s.type === type);
    return s ? (s.data as T) : null;
  }

  type HeroData = { name: string; title: string; bio: string; avatarUrl?: string; ctaHref?: string; ctaText?: string };
  type AboutData = { heading?: string; text: string; tags?: string[] };
  type SkillsData = { heading?: string; skills: Skill[] };
  type ProjectsData = { heading?: string; projects: Project[] };
  type ExperienceData = { heading?: string; experiences: ExpType[] };
  type ContactData = { heading?: string; email?: string; linkedin?: string; github?: string };

  const hero = getSectionData<HeroData>('hero');
  const about = getSectionData<AboutData>('about');
  const skillsData = getSectionData<SkillsData>('skills');
  const projectsData = getSectionData<ProjectsData>('projects');
  const expData = getSectionData<ExperienceData>('experience');
  const contactData = getSectionData<ContactData>('contact');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100" style={{ fontFamily: portfolio.theme.fontFamily }}>
      {/* Hero */}
      {hero && (
        <section className="flex min-h-screen flex-col items-center justify-center px-4 py-20 text-center">
          {hero.avatarUrl && (
            <Image src={hero.avatarUrl} alt={hero.name} width={112} height={112} className="mb-6 h-28 w-28 rounded-full object-cover ring-4 ring-purple-500" unoptimized />
          )}
          <h1 className="mb-2 text-5xl font-extrabold text-purple-400">{hero.name}</h1>
          <p className="mb-4 text-2xl text-gray-300">{hero.title}</p>
          <p className="mb-8 max-w-2xl text-gray-400">{hero.bio}</p>
          {hero.ctaHref && (
            <a href={hero.ctaHref}>
              <Button variant="secondary" size="lg">{hero.ctaText ?? 'Explore My Work'}</Button>
            </a>
          )}
        </section>
      )}

      {/* About */}
      {about && (
        <section className="bg-gray-800 px-4 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-3xl font-bold text-purple-400">{about.heading ?? 'About'}</h2>
            <p className="text-lg leading-relaxed text-gray-300">{about.text}</p>
            {about.tags && (
              <div className="mt-6 flex flex-wrap gap-2">
                {about.tags.map((t) => (
                  <span key={t} className="rounded-full bg-purple-900 px-3 py-1 text-sm text-purple-300">{t}</span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Skills */}
      {skillsData && (
        <section className="px-4 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-3xl font-bold text-purple-400">{skillsData.heading ?? 'Skills'}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {skillsData.skills.map((s) => (
                <div key={s.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-200">{s.name}</span>
                    <span className="text-gray-500">{s.level}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-700">
                    <div className="h-2 rounded-full bg-purple-500 transition-all duration-700" style={{ width: `${s.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {projectsData && (
        <section className="bg-gray-800 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-10 text-3xl font-bold text-purple-400">{projectsData.heading ?? 'Projects'}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projectsData.projects.map((p) => (
                <div key={p.id} className="rounded-xl border border-gray-700 bg-gray-900 p-5">
                  <h3 className="mb-2 font-semibold text-gray-100">{p.title}</h3>
                  <p className="line-clamp-3 text-sm text-gray-400">{p.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.techStack.map((t) => (
                      <span key={t} className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-300">{t}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="secondary">Live</Button></a>}
                    {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="ghost">Code</Button></a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience */}
      {expData && (
        <section className="px-4 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-3xl font-bold text-purple-400">{expData.heading ?? 'Experience'}</h2>
            <div className="space-y-8 border-l-2 border-purple-700 pl-8">
              {expData.experiences.map((e) => (
                <div key={e.id} className="relative">
                  <span className="absolute -left-[41px] top-1.5 h-4 w-4 rounded-full bg-purple-500 ring-4 ring-gray-900" />
                  <h3 className="font-semibold text-gray-100">{e.role} <span className="text-purple-400">@ {e.company}</span></h3>
                  <p className="mt-1 text-sm text-gray-500">{e.startDate} — {e.isCurrent ? 'Present' : e.endDate}</p>
                  <p className="mt-2 text-gray-400">{e.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      {contactData && (
        <section className="bg-gray-800 px-4 py-20 text-center">
          <div className="mx-auto max-w-lg">
            <h2 className="mb-4 text-3xl font-bold text-purple-400">{contactData.heading ?? "Let's Connect"}</h2>
            <div className="mt-6 flex justify-center gap-6 text-sm">
              {contactData.email && <a href={`mailto:${contactData.email}`} className="text-gray-300 hover:text-purple-400">{contactData.email}</a>}
              {contactData.linkedin && <a href={contactData.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-purple-400">LinkedIn</a>}
              {contactData.github && <a href={contactData.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-purple-400">GitHub</a>}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
