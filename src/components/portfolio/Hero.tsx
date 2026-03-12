import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { Theme } from '@/types';

interface HeroData {
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  ctaText?: string;
  ctaHref?: string;
}

interface HeroProps {
  data: HeroData;
  theme?: Pick<Theme, 'primaryColor' | 'textColor'>;
}

export function Hero({ data, theme }: HeroProps) {
  return (
    <section
      className="flex min-h-[90vh] flex-col items-center justify-center px-4 py-20 text-center"
      style={{ color: theme?.textColor }}
    >
      {data.avatarUrl && (
        <Image
          src={data.avatarUrl}
          alt={`${data.name} avatar`}
          width={128}
          height={128}
          className="mb-6 h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-white"
          unoptimized
        />
      )}
      <h1
        className="mb-2 text-5xl font-bold tracking-tight"
        style={{ color: theme?.primaryColor }}
      >
        {data.name}
      </h1>
      <p className="mb-4 text-2xl font-light text-gray-500">{data.title}</p>
      <p className="mb-8 max-w-2xl text-lg text-gray-400">{data.bio}</p>
      {data.ctaHref && (
        <a href={data.ctaHref}>
          <Button size="lg">{data.ctaText ?? 'View My Work'}</Button>
        </a>
      )}
    </section>
  );
}
