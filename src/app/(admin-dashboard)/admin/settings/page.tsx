'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { ROUTES } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';
import { Button } from '@/components/ui/Button';
import { toast } from '@/store/toastStore';
import { ShieldCheck, User, Mail, Calendar, KeyRound } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user, updateUser } = useAuth();
  const { token } = useAuthStore();
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [name, setName] = useState<string>(user?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [profileId, setProfileId] = useState<string>(user?.id ?? '');

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    authService
      .getProfile(token)
      .then((res) => {
        if (cancelled) return;
        const created = res?.data?.createdAt ?? user?.createdAt;
        setCreatedAt(created ?? null);
        setName(res?.data?.name ?? user?.name ?? '');
        setProfileId(res?.data?.id ?? user?.id ?? '');
      })
      .catch(() => toast.error('Failed to refresh admin details'));

    return () => {
      cancelled = true;
    };
  }, [token, user?.id, user?.createdAt, user?.name]);

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Admin Settings"
        subtitle="View your admin account details and quick security actions."
      />

      <DashboardCard
        title="Profile"
        subtitle="Authenticated administrator details"
        actions={<ShieldCheck size={16} className="text-[var(--color-text-muted)]" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <User size={14} />
              Full Name
            </div>
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 rounded-md border px-3 py-2 bg-transparent text-sm text-[var(--color-text)]" />
              <Button isLoading={isSaving} onClick={async () => {
                if (!token || !profileId) {
                  toast.error('Unable to update profile right now.');
                  return;
                }
                setIsSaving(true);
                try {
                  const result = await userService.update(profileId, { name }, token);
                  updateUser({ name: result.data.name });
                  toast.success('Profile updated');
                } catch {
                  toast.error('Failed to update profile');
                } finally {
                  setIsSaving(false);
                }
              }}>Save</Button>
            </div>
          </div>
          <InfoRow label="Email" value={user?.email ?? '-'} icon={<Mail size={14} />} />
          <InfoRow label="Role" value={(user?.role ?? 'admin').toUpperCase()} icon={<ShieldCheck size={14} />} />
          <InfoRow
            label="Joined"
            value={createdAt ? formatDate(createdAt) : '-'}
            icon={<Calendar size={14} />}
          />
        </div>
      </DashboardCard>

      <DashboardCard title="Security" subtitle="Account safety and password management">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={ROUTES.SETTINGS}>
            <Button variant="outline" className="gap-2">
              <KeyRound size={14} /> Change Password
            </Button>
          </Link>
          <Link href={ROUTES.ADMIN}>
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
      </DashboardCard>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3">
      <div className="mb-1 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        {icon}
        {label}
      </div>
      <p className="text-sm font-medium text-[var(--color-text)]">{value}</p>
    </div>
  );
}
