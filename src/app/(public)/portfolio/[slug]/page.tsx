import { notFound } from 'next/navigation';
import { portfolioService } from '@/services/portfolioService';
import { TemplateRenderer } from '@/templates/TemplateRenderer';
import type { Portfolio } from '@/types';

interface Props {
  params: { slug: string };
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { slug } = params;
  try {
    const res = await portfolioService.getBySlug(slug);
    if (!res.success || !res.data || !res.data.isPublished) return notFound();
    const portfolio: Portfolio = res.data;
    return <TemplateRenderer templateId={portfolio.templateId} portfolio={portfolio} />;
  } catch (err) {
    return notFound();
  }
}
