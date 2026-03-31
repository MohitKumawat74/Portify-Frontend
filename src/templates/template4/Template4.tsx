'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Portfolio, Project, Skill } from '@/types';
import { HeroScene } from '@/components/3d/HeroScene';

type HeroData = { name: string; title: string; bio: string; ctaText?: string; ctaHref?: string };
type AboutData = { heading?: string; text: string; tags?: string[] };
type SkillsData = { heading?: string; skills: Skill[] };
type ProjectsData = { heading?: string; projects: Project[] };
type ContactData = { heading?: string; email?: string; linkedin?: string; github?: string };

function getSection<T>(portfolio: Portfolio, type: string): T | null {
  const found = portfolio.sections.find((s) => s.type === type);
  return found ? (found.data as T) : null;
}

export function Template4({ portfolio }: { portfolio: Portfolio }) {
  const prefersReducedMotion = useReducedMotion();
  const [isSmallViewport, setIsSmallViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsSmallViewport(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const disableHeavyHero = Boolean(prefersReducedMotion || isSmallViewport);

  const hero = getSection<HeroData>(portfolio, 'hero');
  const about = getSection<AboutData>(portfolio, 'about');
  const skills = getSection<SkillsData>(portfolio, 'skills');
  const projects = getSection<ProjectsData>(portfolio, 'projects');
  const contact = getSection<ContactData>(portfolio, 'contact');

  return (
    <div
      className="min-h-screen bg-[#060b18] text-white"
      style={{
        color: portfolio.theme.textColor,
        backgroundColor: portfolio.theme.backgroundColor || '#060b18',
        fontFamily: portfolio.theme.fontFamily,
      }}
    >
      <section className="relative isolate min-h-[90vh] overflow-hidden">
        {!disableHeavyHero ? (
          <HeroScene />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(1000px 420px at 15% -5%, ${portfolio.theme.primaryColor}55, transparent 60%), radial-gradient(900px 420px at 85% 5%, ${portfolio.theme.secondaryColor}44, transparent 64%), ${portfolio.theme.backgroundColor || '#060b18'}`,
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/35 via-black/45 to-black/75" />

        {hero && (
          <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-6xl flex-col items-start justify-center px-4 py-16 sm:px-8 sm:py-24 lg:px-10">
            <span className="mb-3 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
              Pro Interactive Template
            </span>
            <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {hero.name}
            </h1>
            <p className="mt-2 text-base text-white/80 sm:text-2xl">{hero.title}</p>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">{hero.bio}</p>
            {hero.ctaHref && (
              <a
                href={hero.ctaHref}
                className="mt-6 inline-flex items-center rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/20 sm:mt-7 sm:px-5 sm:py-3"
              >
                {hero.ctaText || 'Explore Work'}
              </a>
            )}
          </div>
        )}
      </section>

      {about && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16 lg:px-10">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{about.heading || 'About'}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base">{about.text}</p>
          {about.tags?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {about.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-xs text-white/85">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      )}

      {skills && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16 lg:px-10">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{skills.heading || 'Skills'}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.skills.map((skill) => (
              <div key={skill.id} className="rounded-xl border border-white/12 bg-white/6 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-white/90">{skill.name}</span>
                  <span className="text-white/60">{skill.level}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-linear-to-r from-indigo-400 to-cyan-400" style={{ width: `${skill.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {projects && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16 lg:px-10">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{projects.heading || 'Projects'}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.projects.map((project) => (
              <article key={project.id} className="rounded-xl border border-white/12 bg-white/6 p-4 transition-transform hover:-translate-y-1">
                <h3 className="font-semibold text-white">{project.title}</h3>
                <p className="mt-2 text-sm text-white/70 line-clamp-3">{project.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="rounded bg-white/12 px-2 py-0.5 text-[11px] text-white/80">{tech}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {contact && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16 lg:px-10">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{contact.heading || 'Contact'}</h2>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
            {contact.email && <a href={`mailto:${contact.email}`} className="underline decoration-white/40 underline-offset-4 hover:text-white">{contact.email}</a>}
            {contact.linkedin && <a href={contact.linkedin} target="_blank" rel="noreferrer" className="underline decoration-white/40 underline-offset-4 hover:text-white">LinkedIn</a>}
            {contact.github && <a href={contact.github} target="_blank" rel="noreferrer" className="underline decoration-white/40 underline-offset-4 hover:text-white">GitHub</a>}
          </div>
        </section>
      )}
    </div>
  );
}
