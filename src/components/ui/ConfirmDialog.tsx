'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  tone?: 'danger' | 'neutral';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  tone = 'neutral',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const iconTone = tone === 'danger' ? 'text-red-400' : 'text-[var(--color-primary)]';
  const panelTone = tone === 'danger'
    ? 'border-red-500/20 bg-red-500/8'
    : 'border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10';

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm"   >
      <div className="space-y-4 ">
        <div className={`rounded-xl border p-3 ${panelTone}`}>
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${iconTone}`} />
            <p className="text-sm text-[var(--color-text-muted)] ">{description}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} isLoading={isLoading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
