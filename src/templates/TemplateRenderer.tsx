import type { ComponentType } from 'react';
import type { Portfolio } from '@/types';
import { Template1 } from './template1/Template1';
import { Template2 } from './template2/Template2';
import { Template3 } from './template3/Template3';

type TemplateComponent = ComponentType<{ portfolio: Portfolio }>;

/**
 * Registry maps templateId → component.
 * To add a new template, import it and add an entry here.
 */
const templateRegistry: Record<string, TemplateComponent> = {
  template1: Template1,
  template2: Template2,
  template3: Template3,
};

interface TemplateRendererProps {
  templateId: string;
  portfolio: Portfolio;
}

/**
 * Dynamically renders the correct template based on templateId.
 * Falls back to a friendly error UI for unknown templates.
 */
export function TemplateRenderer({ templateId, portfolio }: TemplateRendererProps) {
  const TemplateComponent = templateRegistry[templateId];

  if (!TemplateComponent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-gray-500">
        <p className="text-lg font-medium">Template not found</p>
        <p className="text-sm">No template registered for id: &quot;{templateId}&quot;</p>
      </div>
    );
  }

  return <TemplateComponent portfolio={portfolio} />;
}
