import type { Portfolio, PortfolioSection, Skill, Project, Experience } from '@/types';

const baseSkills: Skill[] = [
  { id: 's1', name: 'React', level: 92, category: 'frontend' },
  { id: 's2', name: 'Next.js', level: 90, category: 'frontend' },
  { id: 's3', name: 'TypeScript', level: 89, category: 'language' },
  { id: 's4', name: 'Node.js', level: 85, category: 'backend' },
  { id: 's5', name: 'UI Design', level: 78, category: 'design' },
  { id: 's6', name: 'MongoDB', level: 81, category: 'database' },
];

const baseProjects: Project[] = [
  {
    id: 'p1',
    title: 'Portfolio Platform',
    description: 'A full-stack portfolio builder with templates, themes, analytics, and admin dashboard.',
    techStack: ['Next.js', 'TypeScript', 'Node.js', 'MongoDB'],
    liveUrl: 'https://example.com',
    repoUrl: 'https://github.com/example/portfolio-platform',
  },
  {
    id: 'p2',
    title: 'Realtime Team Chat',
    description: 'Production chat app with channels, mentions, media uploads, and role-based permissions.',
    techStack: ['React', 'Socket.IO', 'Express', 'PostgreSQL'],
    liveUrl: 'https://example.com',
    repoUrl: 'https://github.com/example/realtime-chat',
  },
  {
    id: 'p3',
    title: 'Headless Commerce Store',
    description: 'High-performance ecommerce storefront with search, cart, and checkout integrations.',
    techStack: ['Next.js', 'Stripe', 'Tailwind', 'Redis'],
    liveUrl: 'https://example.com',
    repoUrl: 'https://github.com/example/headless-store',
  },
];

const baseExperience: Experience[] = [
  {
    id: 'e1',
    company: 'Nova Labs',
    role: 'Senior Frontend Engineer',
    startDate: '2023-02',
    endDate: undefined,
    description: 'Led frontend architecture and improved Lighthouse performance score from 61 to 94.',
    isCurrent: true,
  },
  {
    id: 'e2',
    company: 'Pixel Forge',
    role: 'Full-Stack Developer',
    startDate: '2020-06',
    endDate: '2023-01',
    description: 'Built client-facing dashboards and APIs used by 50k+ monthly active users.',
    isCurrent: false,
  },
];

function makeSections(): PortfolioSection[] {
  return [
    {
      id: 'sec-hero',
      type: 'hero',
      order: 1,
      data: {
        name: 'Alex Morgan',
        title: 'Full-Stack Developer',
        bio: 'I build fast, scalable, and beautiful products that users love.',
        tagline: 'Designing and engineering premium digital products.',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=AlexMorgan',
        ctaPrimaryText: 'Hire Me',
        ctaPrimaryHref: '#contact',
        ctaSecondaryText: 'Download CV',
        ctaSecondaryHref: '#projects',
      },
    },
    {
      id: 'sec-about',
      type: 'about',
      order: 2,
      data: {
        heading: 'About Me',
        text: 'I focus on product-driven engineering, pixel-perfect execution, and measurable business impact. I enjoy turning complex requirements into simple and robust experiences.',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
        tags: ['Product Thinking', 'Performance', 'Design Systems', 'Team Leadership'],
        highlights: ['7+ Years Experience', '48 Shipped Projects', '22 Global Clients'],
      },
    },
    {
      id: 'sec-skills',
      type: 'skills',
      order: 3,
      data: {
        heading: 'Skills',
        skills: baseSkills,
      },
    },
    {
      id: 'sec-projects',
      type: 'projects',
      order: 4,
      data: {
        heading: 'Projects',
        projects: baseProjects,
      },
    },
    {
      id: 'sec-exp',
      type: 'experience',
      order: 5,
      data: {
        heading: 'Experience',
        experiences: baseExperience,
      },
    },
    {
      id: 'sec-contact',
      type: 'contact',
      order: 6,
      data: {
        heading: 'Get In Touch',
        description: 'Open to full-time roles, consulting projects, and product collaborations.',
        email: 'alex@example.com',
        phone: '+1 (555) 120-3344',
        location: 'Remote / Dubai',
        website: 'https://example.dev',
        linkedin: 'https://linkedin.com/in/alexmorgan',
        github: 'https://github.com/alexmorgan',
        socialLinks: [
          { id: 'social-1', label: 'Dribbble', href: 'https://dribbble.com' },
          { id: 'social-2', label: 'X', href: 'https://x.com' },
        ],
      },
    },
    {
      id: 'sec-testimonials',
      type: 'testimonials',
      order: 7,
      data: {
        heading: 'Testimonials',
        testimonials: [
          {
            id: 't1',
            name: 'Sarah Khan',
            role: 'Product Manager, Nova Labs',
            quote: 'Alex combines design thinking and engineering depth in a way that consistently elevates product quality.',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
          },
          {
            id: 't2',
            name: 'James Lee',
            role: 'Founder, Pixel Forge',
            quote: 'Delivery quality, communication, and execution were exceptional from kickoff to launch.',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
          },
        ],
      },
    },
    {
      id: 'sec-footer',
      type: 'footer',
      order: 8,
      data: {
        copyright: '© 2026 Alex Morgan. All rights reserved.',
        links: [
          { id: 'f1', label: 'Home', href: '#hero' },
          { id: 'f2', label: 'Projects', href: '#projects' },
          { id: 'f3', label: 'Contact', href: '#contact' },
        ],
      },
    },
  ];
}

function themeByTemplate(templateId: string) {
  if (templateId === 'template4') {
    return {
      primaryColor: '#7c3aed',
      secondaryColor: '#06b6d4',
      backgroundColor: '#060b18',
      textColor: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
    };
  }

  if (templateId === 'template2') {
    return {
      primaryColor: '#8b5cf6',
      secondaryColor: '#06b6d4',
      backgroundColor: '#0f172a',
      textColor: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
    };
  }

  if (templateId === 'template3') {
    return {
      primaryColor: '#2563eb',
      secondaryColor: '#1d4ed8',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      fontFamily: 'Inter, sans-serif',
    };
  }

  return {
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    fontFamily: 'Inter, sans-serif',
  };
}

export function getTemplatePreviewPortfolio(templateId: string): Portfolio {
  const resolvedTemplateId = ['template1', 'template2', 'template3', 'template4'].includes(templateId) ? templateId : 'template1';

  return {
    id: `preview-${resolvedTemplateId}`,
    userId: 'preview-user',
    title: 'Alex Morgan Portfolio',
    slug: `preview-${resolvedTemplateId}`,
    templateId: resolvedTemplateId,
    theme: themeByTemplate(resolvedTemplateId),
    sections: makeSections(),
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
