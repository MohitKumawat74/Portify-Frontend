'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME, ROUTES } from '@/utils/constants';

const navItems = [
  { label: 'Overview', href: ROUTES.DASHBOARD },
  { label: 'My Portfolios', href: ROUTES.PORTFOLIOS },
  { label: 'Create Portfolio', href: ROUTES.CREATE_PORTFOLIO },
  { label: 'Templates', href: ROUTES.TEMPLATES },
  { label: 'Settings', href: ROUTES.SETTINGS },
];

export function UserSidebar() {
  const { user, logout } = useAuth();

  return (
    <Sidebar
      navItems={navItems}
      title={APP_NAME}
      footer={
        <div className="flex flex-col gap-3">
          <div className="text-xs">
            <p className="font-medium text-gray-800">{user?.name}</p>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" fullWidth onClick={logout}>
            Sign Out
          </Button>
        </div>
      }
    />
  );
}
