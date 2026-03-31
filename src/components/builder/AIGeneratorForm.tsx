'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface AIGeneratorValues {
  name: string;
  role: string;
  skills: string;
  experience: string;
}

interface AIGeneratorFormProps {
  loading: boolean;
  onGenerate: (values: AIGeneratorValues) => Promise<void>;
  canUseAI: boolean;
  onUpgradeRequired: () => void;
  onRetry?: () => Promise<void>;
  initialValues?: Partial<AIGeneratorValues>;
}

const EMPTY_VALUES: AIGeneratorValues = {
  name: '',
  role: '',
  skills: '',
  experience: '',
};

export function AIGeneratorForm({
  loading,
  onGenerate,
  canUseAI,
  onUpgradeRequired,
  onRetry,
  initialValues: seedValues,
}: AIGeneratorFormProps) {
  const [values, setValues] = useState<AIGeneratorValues>(EMPTY_VALUES);

  useEffect(() => {
    if (!seedValues) return;

    setValues((prev) => ({
      name: prev.name || seedValues.name || '',
      role: prev.role || seedValues.role || '',
      skills: prev.skills || seedValues.skills || '',
      experience: prev.experience || seedValues.experience || '',
    }));
  }, [seedValues]);

  const resolvedPayload = useMemo<AIGeneratorValues>(() => {
    const fallbackName = (seedValues?.name || '').trim() || 'Portfolio Owner';
    const fallbackRole = (seedValues?.role || '').trim() || 'Full-Stack Developer';
    const fallbackSkills = (seedValues?.skills || '').trim() || 'React, TypeScript, Next.js';
    const fallbackExperience = (seedValues?.experience || '').trim() || 'Built and shipped modern web products.';

    return {
      name: values.name.trim() || fallbackName,
      role: values.role.trim() || fallbackRole,
      skills: values.skills.trim() || fallbackSkills,
      experience: values.experience.trim() || fallbackExperience,
    };
  }, [values, seedValues]);

  const submit = async () => {
    if (!canUseAI) {
      onUpgradeRequired();
      return;
    }
    await onGenerate(resolvedPayload);
  };

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">AI Portfolio Generator</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Generate structured sections in one click.</p>
        </div>
        <Sparkles size={16} className="text-[var(--color-primary)]" />
      </div>

      <div className="grid gap-3">
        <input
          value={values.name}
          onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Name"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/60"
        />
        <input
          value={values.role}
          onChange={(e) => setValues((prev) => ({ ...prev, role: e.target.value }))}
          placeholder="Role"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/60"
        />
        <textarea
          value={values.skills}
          onChange={(e) => setValues((prev) => ({ ...prev, skills: e.target.value }))}
          placeholder="Skills (comma-separated)"
          rows={2}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/60"
        />
        <textarea
          value={values.experience}
          onChange={(e) => setValues((prev) => ({ ...prev, experience: e.target.value }))}
          placeholder="Experience"
          rows={3}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/60"
        />
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={submit} isLoading={loading} className="gap-1.5">
          <Sparkles size={13} /> Generate with AI
        </Button>
        {onRetry && (
          <Button variant="ghost" onClick={onRetry} className="gap-1.5" disabled={loading}>
            <RefreshCcw size={13} /> Retry
          </Button>
        )}
      </div>
    </div>
  );
}
