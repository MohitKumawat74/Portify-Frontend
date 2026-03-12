import type { Experience as ExperienceType } from '@/types';

interface ExperienceData {
  heading?: string;
  experiences: ExperienceType[];
}

export function Experience({ data }: { data: ExperienceData }) {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-10 text-3xl font-bold text-gray-900">
          {data.heading ?? 'Experience'}
        </h2>
        <div className="relative space-y-8 border-l-2 border-indigo-200 pl-8">
          {data.experiences.map((exp) => (
            <div key={exp.id} className="relative">
              <span className="absolute -left-[41px] top-1.5 h-4 w-4 rounded-full bg-indigo-600 ring-4 ring-white" />
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{exp.role}</h3>
                <span className="font-medium text-indigo-600">@ {exp.company}</span>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
              </p>
              <p className="mt-2 leading-relaxed text-gray-600">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
