'use client';

import { useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { GripVertical, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { BuilderSection, BuilderSectionType } from '@/store/portfolioBuilderStore';

interface BuilderSectionListProps {
  sections: BuilderSection[];
  activeSectionId: string | null;
  canAddSection: boolean;
  onSelectSection: (id: string) => void;
  onRemoveSection: (id: string) => void;
  onReorder: (idsInOrder: string[]) => void;
  onAddSection: (type: BuilderSectionType) => void;
  onUpgradeRequired: () => void;
}

export function BuilderSectionList({
  sections,
  activeSectionId,
  canAddSection,
  onSelectSection,
  onRemoveSection,
  onReorder,
  onAddSection,
  onUpgradeRequired,
}: BuilderSectionListProps) {
  const items = useMemo(() => [...sections].sort((a, b) => a.order - b.order), [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((s) => s.id === active.id);
    const newIndex = items.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    onReorder(reordered.map((section) => section.id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Sections</h3>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Drag to reorder. Click a section to edit.</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {items.map((section) => (
                <SortableSectionRow
                  key={section.id}
                  section={section}
                  active={activeSectionId === section.id}
                  onSelect={() => onSelectSection(section.id)}
                  onRemove={() => onRemoveSection(section.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      <AddSectionRow
        canAddSection={canAddSection}
        onAddSection={onAddSection}
        onUpgradeRequired={onUpgradeRequired}
      />
    </div>
  );
}

function SortableSectionRow({
  section,
  active,
  onSelect,
  onRemove,
}: {
  section: BuilderSection;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={[
        'group flex items-center gap-2 rounded-xl border px-3 py-2 transition-all',
        active
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
          : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary)]/40',
        isDragging ? 'opacity-90 shadow-[0_10px_30px_rgba(0,0,0,0.35)]' : '',
      ].join(' ')}
      onClick={onSelect}
    >
      <button
        type="button"
        className="cursor-grab rounded-md p-1 text-[var(--color-text-muted)] hover:bg-white/10 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium capitalize text-[var(--color-text)]">{section.type}</p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400"
        title="Remove section"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

function AddSectionRow({
  canAddSection,
  onAddSection,
  onUpgradeRequired,
}: {
  canAddSection: boolean;
  onAddSection: (type: BuilderSectionType) => void;
  onUpgradeRequired: () => void;
}) {
  const options: BuilderSectionType[] = ['hero', 'about', 'skills', 'projects', 'contact'];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <PlusCircle size={13} />
        Add section
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((type) => (
          <Button
            key={type}
            type="button"
            size="sm"
            variant="ghost"
            className="capitalize"
            onClick={() => {
              if (!canAddSection) {
                onUpgradeRequired();
                return;
              }
              onAddSection(type);
            }}
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
}
