export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  content: string[];
};

export const POSTS: Post[] = [
  {
    slug: 'build-a-portfolio-recruiters-read',
    title: 'How to Build a Portfolio That Recruiters Actually Read',
    excerpt:
      'A practical framework for turning your project list into a story that hiring teams understand in under 30 seconds.',
    category: 'Portfolio Strategy',
    readTime: '6 min read',
    date: 'Mar 2026',
    content: [
      'Recruiters scan a portfolio in seconds. Lead with outcomes, followed by what you built and why.',
      'Use case studies: problem, approach, impact. Include metrics where possible.',
      'Keep the UI clean and the narrative consistent across projects.'
    ],
  },
  {
    slug: '2026-developer-resume-stack',
    title: 'The 2026 Developer Resume Stack: Portfolio + Proof + Signal',
    excerpt:
      'Why your portfolio should be your source of truth, and how to align it with your resume, LinkedIn, and GitHub profile.',
    category: 'Career Growth',
    readTime: '8 min read',
    date: 'Feb 2026',
    content: [
      'Treat your portfolio as the canonical source for projects and impact.',
      'Make sure signals (resume, LinkedIn, GitHub) all point to the same highlights.'
    ],
  },
  {
    slug: 'design-without-designer',
    title: 'Design Without a Designer: Typography, Contrast, and Rhythm',
    excerpt:
      'Simple visual rules that make your portfolio feel polished, even if design is not your core skill.',
    category: 'Design',
    readTime: '7 min read',
    date: 'Jan 2026',
    content: [
      'Use a strong typographic scale and consistent spacing.',
      'Limit colors and use contrast to lead attention.'
    ],
  },
  {
    slug: 'ship-case-studies-fast',
    title: 'Ship Case Studies Fast: A 60-Minute Structure You Can Reuse',
    excerpt:
      'A repeatable writing template to publish better project case studies in one focused session.',
    category: 'Productivity',
    readTime: '5 min read',
    date: 'Dec 2025',
    content: [
      'Start with the business context. Explain who the project served and what outcome mattered most.',
      'Document constraints early: time, team size, and technical boundaries. This makes decisions easier to understand.',
      'Break the body into three parts: decisions, implementation, and result. Readers remember structure.',
      'Always include one section on tradeoffs. Hiring managers value judgment more than perfect outcomes.',
      'Finish with what changed after launch: speed, conversion, retention, or developer productivity.'
    ],
  },
  {
    slug: 'portfolio-seo-for-devs',
    title: 'Portfolio SEO for Developers: Rank Your Work, Not Just Your Name',
    excerpt:
      'Practical SEO basics that help your project pages show up in search and bring relevant traffic.',
    category: 'Growth',
    readTime: '9 min read',
    date: 'Nov 2025',
    content: [
      'Give each project page a specific intent, such as React dashboard architecture or Next.js performance optimization.',
      'Use meaningful titles and descriptions per page. Generic titles like Project One do not rank well.',
      'Add internal links between related case studies to improve discoverability and session depth.',
      'Include concise alt text on visuals to support accessibility and improve image search context.',
      'Track which pages receive impressions and update weak sections monthly with clearer headings and examples.'
    ],
  },
  {
    slug: 'client-projects-without-chaos',
    title: 'Client Projects Without Chaos: Scope, Milestones, and Demo Rhythm',
    excerpt:
      'A simple operating model for freelance and agency developers to keep delivery predictable.',
    category: 'Freelance',
    readTime: '7 min read',
    date: 'Oct 2025',
    content: [
      'Define scope as outcomes and exclusions. Ambiguity at kickoff becomes conflict later.',
      'Set milestone demos every one or two weeks and keep each demo focused on completed outcomes.',
      'Use a shared changelog so clients can see progress without status meetings every day.',
      'Capture decisions in writing the same day. This protects both delivery speed and trust.',
      'Close every milestone with a concise retrospective: what worked, what changed, and what is next.'
    ],
  },
];

export function findPostBySlug(slug: string): Post | null {
  return POSTS.find((p) => p.slug === slug) ?? null;
}

export default POSTS;
