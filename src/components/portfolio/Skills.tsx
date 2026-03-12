import type { Skill } from '@/types';

interface SkillsData {
  heading?: string;
  skills: Skill[];
}

export function Skills({ data }: { data: SkillsData }) {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-10 text-3xl font-bold text-gray-900">
          {data.heading ?? 'Skills'}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {data.skills.map((skill) => (
            <div key={skill.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{skill.name}</span>
                <span className="text-gray-400">{skill.level}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-indigo-600 transition-all duration-700 ease-out"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
