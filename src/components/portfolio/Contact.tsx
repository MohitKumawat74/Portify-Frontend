'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ContactData {
  heading?: string;
  email?: string;
  linkedin?: string;
  github?: string;
}

export function Contact({ data }: { data: ContactData }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Wire up to your messaging API here
    setSent(true);
  }

  return (
    <section className="bg-gray-50 px-4 py-20">
      <div className="mx-auto max-w-xl">
        <h2 className="mb-8 text-3xl font-bold text-gray-900">
          {data.heading ?? 'Contact Me'}
        </h2>

        {sent ? (
          <p className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
            Message sent! I&apos;ll get back to you soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              fullWidth
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <Button type="submit" fullWidth>
              Send Message
            </Button>
          </form>
        )}

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-500">
          {data.email && (
            <a href={`mailto:${data.email}`} className="hover:text-indigo-600">
              {data.email}
            </a>
          )}
          {data.linkedin && (
            <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
              LinkedIn
            </a>
          )}
          {data.github && (
            <a href={data.github} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
              GitHub
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
