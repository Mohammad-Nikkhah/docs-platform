"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "دوره‌های من", Icon: LayoutDashboard },
  { href: "/dashboard/progress", label: "پیشرفت", Icon: TrendingUp },
  { href: "/dashboard/profile", label: "پروفایل", Icon: User },
];

export function DashboardTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="داشبورد" className="mb-8 flex gap-1 overflow-x-auto border-b">
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm text-muted hover:text-foreground",
              active && "border-accent text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
