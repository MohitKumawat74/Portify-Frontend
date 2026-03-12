import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Project } from '@/types';

interface ProjectsData {
  heading?: string;
  projects: Project[];
}

export function Projects({ data }: { data: ProjectsData }) {
  return (
    <section className="bg-gray-50 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-3xl font-bold text-gray-900">
          {data.heading ?? 'Projects'}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.projects.map((project) => (
            <Card key={project.id} hoverable>
              {project.image && (
                <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <Card.Title>{project.title}</Card.Title>
              <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                {project.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm">Live</Button>
                  </a>
                )}
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">
                      Code
                    </Button>
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
