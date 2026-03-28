import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { findPostBySlug, POSTS } from '../../../../data/blogPosts';
import { notFound } from 'next/navigation';

type Props = { params: { slug: string | string[] } | Promise<{ slug: string | string[] }> };

export default async function BlogDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = Array.isArray(resolvedParams.slug) ? resolvedParams.slug[0] : resolvedParams.slug;
  const post = slug ? findPostBySlug(slug) : null;
  if (!post) return notFound();

  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20 sm:pb-24 md:pb-28">
        <Container maxWidth="md">
          <div className="mb-6">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-(--color-primary) hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to blog
            </Link>
          </div>
          <header className="mb-8">
            <h1 className="mb-2 text-3xl font-extrabold text-white">{post.title}</h1>
            <p className="text-sm text-(--color-text-muted)">{post.date} • {post.readTime}</p>
          </header>

          <article className="prose max-w-none text-(--color-text-muted) prose-invert">
            {post.content.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <h2 className='mt-5'>How I approached this</h2>
            <p>
              I wrote this article with a focus on concrete steps and pragmatic examples. Whenever possible, I
              prioritized things you can apply in the next day or two: short experiments, lightweight
              documentation, and measurable outcomes.
            </p>
             <br />

            <h3>Examples & Practical Tips</h3>
            <p>
              Consider creating a short checklist for each project: audience, outcome, constraints, architecture,
              and a single metric to measure. This checklist helps you write clearer case studies and surfaces
              the information hiring teams care about.
            </p>
                <br />

            <h3>Further reading</h3>
            <p>
              Below are related posts that expand on specific parts of this article (SEO, case studies, and
              shipping faster).
            </p>
          </article>

          <section className="mt-8">
            <h4 className="mb-4 text-lg font-semibold text-white">Related posts</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {POSTS.filter((p) => p.slug !== post.slug).slice(0, 4).map((rp) => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} className="glass rounded-lg p-3 text-sm text-(--color-text-muted) hover:text-white">
                  <div className="font-semibold text-white">{rp.title}</div>
                  <div className="text-xs">{rp.excerpt}</div>
                </Link>
              ))}
            </div>
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
