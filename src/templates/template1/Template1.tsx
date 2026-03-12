import { Hero } from '@/components/portfolio/Hero';
import { About } from '@/components/portfolio/About';
import { Skills } from '@/components/portfolio/Skills';
import { Projects } from '@/components/portfolio/Projects';
import { Experience } from '@/components/portfolio/Experience';
import { Contact } from '@/components/portfolio/Contact';
import type { Portfolio, Skill, Project, Experience as ExpType } from '@/types';

type HeroData    = { name: string; title: string; bio: string; avatarUrl?: string; ctaText?: string; ctaHref?: string };
type AboutData   = { heading?: string; text: string; tags?: string[] };
type SkillsData  = { heading?: string; skills: Skill[] };
type ProjectsData = { heading?: string; projects: Project[] };
type ExpData     = { heading?: string; experiences: ExpType[] };
type ContactData = { heading?: string; email?: string; linkedin?: string; github?: string };

/** Template 1 — Modern / Minimal (light, indigo accents) */
export function Template1({ portfolio }: { portfolio: Portfolio }) {
  const { sections, theme } = portfolio;

  function get<T>(type: string): T | null {
    const found = sections.find((s) => s.type === type);
    return found ? (found.data as T) : null;
  }

  const hero     = get<HeroData>('hero');
  const about    = get<AboutData>('about');
  const skills   = get<SkillsData>('skills');
  const projects = get<ProjectsData>('projects');
  const exp      = get<ExpData>('experience');
  const contact  = get<ContactData>('contact');

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
      }}
    >
      {hero     && <Hero data={hero} theme={theme} />}
      {about    && <About data={about} />}
      {skills   && <Skills data={skills} />}
      {projects && <Projects data={projects} />}
      {exp      && <Experience data={exp} />}
      {contact  && <Contact data={contact} />}
    </div>
  );
}
