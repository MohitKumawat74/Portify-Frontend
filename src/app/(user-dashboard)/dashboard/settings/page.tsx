'use client';

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DashboardCard, PageHeader } from '@/components/dashboard/DashboardCard';
import { toast } from '@/store/toastStore';
import { cn } from '@/utils/cn';
import {
  CheckCircle2, User, Lock, Bell, Shield, Camera,
  Upload, Eye, EyeOff, AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { token } = useAuthStore();

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification preferences (local-only, no API for this - UI demo)
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    portfolioViews: true,
    marketing: false,
  });

  // Danger zone
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !user) return;
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      const res = await userService.update(user.id, { name: profileForm.name.trim() }, token);
      updateUser({ name: res.data.name });
      toast.success('Profile updated successfully!');
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !user) return;
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await userService.changePassword(
        user.id,
        { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
        token,
      );
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await userService.uploadAvatar(user.id, formData, token);
      updateUser({ avatar: res.data.avatarUrl });
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Avatar upload failed.');
      setAvatarPreview(user.avatar ?? null);
    } finally {
      setUploadingAvatar(false);
    }
  }

  const passwordStrength = (pw: string) => {
    if (!pw) return null;
    const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (score === 2) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-500', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const pwStrength = passwordStrength(passwordForm.newPassword);
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';

  return (
    <div className="space-y-5 max-w-2xl pb-8">
      <PageHeader title="Settings" subtitle="Manage your account preferences and profile." />

      {/* Profile + Avatar */}
      <form onSubmit={handleProfileSubmit}>
        <DashboardCard
          title="Profile Information"
          subtitle="Update your name and profile photo."
          actions={<User size={16} className="text-[var(--color-text-muted)]" />}
        >
          {/* Avatar picker */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-2xl font-bold text-white shadow-lg">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                  <Upload size={16} className="animate-bounce text-white" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-all hover:scale-110 disabled:opacity-50"
                title="Change avatar"
              >
                <Camera size={11} />
              </button>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="text-sm font-medium text-[var(--color-text)]">{user?.name ?? 'Your Name'}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p>
              <button
                type="button"
                className="mt-1.5 text-xs text-[var(--color-primary)] hover:underline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? 'Uploading…' : 'Change photo'}
              </button>
              <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">JPEG or PNG · max 2 MB</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              fullWidth
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Email Address</label>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
                <span className="text-sm text-[var(--color-text-muted)]">{user?.email ?? ''}</span>
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--color-text-muted)]">Cannot change</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Role</label>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
                <span className="capitalize text-sm text-[var(--color-text)]">{user?.role ?? 'user'}</span>
                <span className="ml-auto rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-primary)] capitalize">
                  {user?.role ?? 'user'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button type="submit" isLoading={savingProfile} className="gap-1.5">
              {profileSaved ? <CheckCircle2 size={14} /> : null}
              {profileSaved ? 'Saved!' : 'Save Profile'}
            </Button>
            {profileSaved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} /> Changes saved
              </span>
            )}
          </div>
        </DashboardCard>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePasswordSubmit}>
        <DashboardCard
          title="Change Password"
          subtitle="Use a strong password with at least 8 characters."
          actions={<Lock size={16} className="text-[var(--color-text-muted)]" />}
        >
          <div className="space-y-4">
            {passwordError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-400">
                <AlertTriangle size={13} className="shrink-0" />
                {passwordError}
              </div>
            )}

            {/* Current password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 pr-10 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                <button type="button" onClick={() => setShowCurrentPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">New Password</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 pr-10 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
                <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {/* Password strength */}
              {pwStrength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div className={cn('h-full rounded-full transition-all duration-300', pwStrength.color)} style={{ width: pwStrength.width }} />
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Strength: <span className={cn(
                      'font-medium',
                      pwStrength.label === 'Strong' ? 'text-emerald-400' :
                      pwStrength.label === 'Good' ? 'text-blue-400' :
                      pwStrength.label === 'Fair' ? 'text-amber-400' : 'text-red-400',
                    )}>{pwStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <Input
              label="Confirm New Password"
              type="password"
              fullWidth
              placeholder="••••••••"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size={11} /> Passwords do not match
              </p>
            )}
            {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword.length > 0 && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={11} /> Passwords match
              </p>
            )}
          </div>

          <div className="mt-5">
            <Button type="submit" isLoading={savingPassword}>
              Change Password
            </Button>
          </div>
        </DashboardCard>
      </form>

      {/* Notifications */}
      <DashboardCard
        title="Notifications"
        subtitle="Choose what updates you receive via email."
        actions={<Bell size={16} className="text-[var(--color-text-muted)]" />}
      >
        <div className="divide-y divide-[var(--color-border)]">
          {[
            { key: 'emailUpdates' as const,   label: 'Product updates', desc: 'Receive news, features, and platform announcements' },
            { key: 'portfolioViews' as const,  label: 'Portfolio views',  desc: 'Get notified when your portfolios are visited' },
            { key: 'marketing' as const,       label: 'Marketing emails', desc: 'Tips, tutorials, and promotional content' },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between gap-4 py-3.5 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{item.label}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications[item.key]}
                onClick={() => setNotifications((v) => ({ ...v, [item.key]: !v[item.key] }))}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200',
                  notifications[item.key] ? 'bg-[var(--color-primary)]' : 'bg-white/10',
                )}
              >
                <span
                  className={cn(
                    'h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                    notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5',
                  )}
                />
              </button>
            </label>
          ))}
        </div>
      </DashboardCard>

      {/* Danger Zone */}
      <DashboardCard
        title="Danger Zone"
        subtitle="Irreversible actions that permanently affect your account."
        actions={<Shield size={16} className="text-red-400" />}
      >
        {!showDeleteConfirm ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">Delete Account</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Permanently delete your account and all portfolios. This cannot be undone.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)} className="shrink-0">
              Delete Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <div className="flex items-start gap-2 text-red-400">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <p className="text-xs font-medium">
                This will permanently delete your account, all portfolios, and all data. This action cannot be undone.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">
                Type <span className="font-mono font-bold text-[var(--color-text)]">DELETE</span> to confirm
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-xl border border-red-500/30 bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-red-500/60 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={() => toast.error('Account deletion is not available in this demo.')}
              >
                Permanently Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
