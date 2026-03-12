import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { TopNavbar } from '@/components/dashboard/TopNavbar';
import { APP_NAME } from '@/utils/constants';

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <DashboardSidebar title={APP_NAME} variant="user" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNavbar title="Dashboard" />
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 pt-20 sm:px-6 sm:pt-6 lg:px-8 lg:pt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
