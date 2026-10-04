import { DashboardTabs } from "@/components/dashboard-tabs";
import { requireUser } from "@/lib/auth-guards";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/dashboard");
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <DashboardTabs />
      {children}
    </div>
  );
}
