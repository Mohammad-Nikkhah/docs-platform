import Link from "next/link";
import { BookOpen, FilePlus2, LayoutDashboard } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { requireAdmin } from "@/lib/auth-guards";

const links = [
  { href: "/admin", label: "نمای کلی", Icon: LayoutDashboard },
  { href: "/admin/courses", label: "دوره‌ها", Icon: BookOpen },
  { href: "/admin/lessons/new", label: "درس جدید", Icon: FilePlus2 },
];

// Server-side authorization for every /admin/* route (role read from DB session).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[12rem_minmax(0,1fr)]">
        <nav aria-label="مدیریت" className="flex gap-1 overflow-x-auto md:flex-col">
          {links.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm hover:bg-surface">
              <Icon className="size-4 text-muted" />
              {label}
            </Link>
          ))}
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
