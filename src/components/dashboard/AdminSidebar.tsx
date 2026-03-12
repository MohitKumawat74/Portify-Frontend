'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME, ROUTES } from '@/utils/constants';

const navItems = [
  { label: 'Dashboard', href: ROUTES.ADMIN },
  { label: 'Users', href: ROUTES.ADMIN_USERS },
  { label: 'Templates', href: ROUTES.ADMIN_TEMPLATES },
  { label: 'Themes', href: ROUTES.ADMIN_THEMES },
  { label: 'Analytics', href: ROUTES.ADMIN_ANALYTICS },
];

export function AdminSidebar() {
  const { user, logout } = useAuth();

  return (
    <Sidebar
      navItems={navItems}
      title={`${APP_NAME} Admin`}
      footer={
        <div className="flex flex-col gap-3">
          <div className="text-xs">
            <p className="font-medium text-gray-800">{user?.name}</p>
            <p className="capitalize text-indigo-600">{user?.role}</p>
          </div>
          <Button variant="outline" size="sm" fullWidth onClick={logout}>
            Sign Out
          </Button>
        </div>
      }
    />
  );
}
