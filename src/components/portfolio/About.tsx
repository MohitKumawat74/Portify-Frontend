interface AboutData {
  heading?: string;
  text: string;
  tags?: string[];
}

export function About({ data }: { data: AboutData }) {
  return (
    <section className="bg-gray-50 px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-3xl font-bold text-gray-900">
          {data.heading ?? 'About Me'}
        </h2>
        <p className="text-lg leading-relaxed text-gray-600">{data.text}</p>
        {data.tags && data.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
