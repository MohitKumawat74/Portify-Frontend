import Image from 'next/image';
import type { Portfolio, Skill, Project, Experience as ExpType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';

/** Template 3 — Professional / Classic (white, blue accents, two-column sections) */
export function Template3({ portfolio }: { portfolio: Portfolio }) {
  const { sections, theme } = portfolio;

  function get<T>(type: string): T | null {
    const s = sections.find((s) => s.type === type);
    return s ? (s.data as T) : null;
  }

  type HeroData = { name: string; title: string; bio: string; avatarUrl?: string; ctaHref?: string; ctaText?: string };
  type AboutData = { heading?: string; text: string; tags?: string[] };
  type SkillsData = { heading?: string; skills: Skill[] };
  type ProjectsData = { heading?: string; projects: Project[] };
  type ExperienceData = { heading?: string; experiences: ExpType[] };
  type ContactData = { heading?: string; email?: string; linkedin?: string; github?: string };

  const hero = get<HeroData>('hero');
  const about = get<AboutData>('about');
  const skillsData = get<SkillsData>('skills');
  const projectsData = get<ProjectsData>('projects');
  const expData = get<ExperienceData>('experience');
  const contactData = get<ContactData>('contact');

  const primary = theme.primaryColor ?? '#2563eb';

  return (
    <div className="min-h-screen bg-white text-gray-800" style={{ fontFamily: theme.fontFamily }}>
      {/* Top banner */}
      <div style={{ backgroundColor: primary }} className="py-3 text-center text-sm font-medium text-white">
        Professional Portfolio
      </div>

      {/* Hero — two column */}
      {hero && (
        <Container maxWidth="lg">
          <div className="flex flex-col items-center gap-10 py-20 sm:flex-row sm:items-start">
            {hero.avatarUrl && (
              <Image src={hero.avatarUrl} alt={hero.name} width={160} height={160} className="h-40 w-40 flex-shrink-0 rounded-2xl object-cover shadow-md" unoptimized />
            )}
            <div>
              <h1 className="mb-1 text-4xl font-bold" style={{ color: primary }}>{hero.name}</h1>
              <p className="mb-3 text-xl text-gray-500">{hero.title}</p>
              <p className="mb-6 leading-relaxed text-gray-600">{hero.bio}</p>
              {hero.ctaHref && (
                <a href={hero.ctaHref}>
                  <Button size="md">{hero.ctaText ?? 'Download CV'}</Button>
                </a>
              )}
            </div>
          </div>
        </Container>
      )}

      <hr className="border-gray-200" />

      {/* About */}
      {about && (
        <Container maxWidth="lg">
          <section className="py-16">
            <h2 className="mb-5 text-2xl font-bold" style={{ color: primary }}>{about.heading ?? 'Profile'}</h2>
            <p className="leading-relaxed text-gray-600">{about.text}</p>
            {about.tags && (
              <div className="mt-4 flex flex-wrap gap-2">
                {about.tags.map((t) => (
                  <span key={t} className="rounded border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">{t}</span>
                ))}
              </div>
            )}
          </section>
        </Container>
      )}

      {/* Skills */}
      {skillsData && (
        <div className="bg-gray-50 py-16">
          <Container maxWidth="lg">
            <h2 className="mb-8 text-2xl font-bold" style={{ color: primary }}>{skillsData.heading ?? 'Competencies'}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skillsData.skills.map((s) => (
                <div key={s.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex justify-between text-sm font-medium">
                    <span>{s.name}</span>
                    <span style={{ color: primary }}>{s.level}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-200">
                    <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${s.level}%`, backgroundColor: primary }} />
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* Experience */}
      {expData && (
        <Container maxWidth="lg">
          <section className="py-16">
            <h2 className="mb-8 text-2xl font-bold" style={{ color: primary }}>{expData.heading ?? 'Work Experience'}</h2>
            <div className="space-y-6">
              {expData.experiences.map((e) => (
                <div key={e.id} className="rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{e.role}</h3>
                      <p className="text-sm font-medium" style={{ color: primary }}>{e.company}</p>
                    </div>
                    <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600">
                      {e.startDate} — {e.isCurrent ? 'Present' : e.endDate}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{e.description}</p>
                </div>
              ))}
            </div>
          </section>
        </Container>
      )}

      {/* Projects */}
      {projectsData && (
        <div className="bg-gray-50 py-16">
          <Container maxWidth="lg">
            <h2 className="mb-8 text-2xl font-bold" style={{ color: primary }}>{projectsData.heading ?? 'Selected Projects'}</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {projectsData.projects.map((p) => (
                <div key={p.id} className="flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-1 font-semibold">{p.title}</h3>
                  <p className="flex-1 text-sm text-gray-500">{p.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.techStack.map((t) => (
                      <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{t}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"><Button size="sm">Live</Button></a>}
                    {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline">Repo</Button></a>}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* Contact */}
      {contactData && (
        <div style={{ backgroundColor: primary }} className="py-12 text-white">
          <Container maxWidth="lg">
            <h2 className="mb-4 text-2xl font-bold">{contactData.heading ?? 'Get In Touch'}</h2>
            <div className="flex flex-wrap gap-6 text-sm">
              {contactData.email && <a href={`mailto:${contactData.email}`} className="underline hover:opacity-80">{contactData.email}</a>}
              {contactData.linkedin && <a href={contactData.linkedin} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">LinkedIn</a>}
              {contactData.github && <a href={contactData.github} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">GitHub</a>}
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}
