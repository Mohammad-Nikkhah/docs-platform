"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { cn, formatOrder } from "@/lib/utils";

export type SidebarLesson = { id: string; title: string; slug: string; order: number; completed: boolean };

export function SidebarNav({
  courseSlug,
  lessons,
  onNavigate,
}: {
  courseSlug: string;
  lessons: SidebarLesson[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  if (lessons.length === 0) {
    return <p className="px-3 py-4 text-sm text-muted">هنوز درسی منتشر نشده است.</p>;
  }

  return (
    <nav aria-label="فهرست درس‌ها">
      <ol className="space-y-0.5">
        {lessons.map((lesson, index) => {
          const href = `/docs/${courseSlug}/${lesson.slug}`;
          const active = decodeURIComponent(pathname) === href;
          return (
            <li key={lesson.id}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-surface",
                  active && "bg-surface font-semibold text-accent",
                )}
              >
                <span dir="ltr" className="w-6 shrink-0 font-mono text-xs text-muted">
                  {formatOrder(index + 1)}
                </span>
                <span className="flex-1">{lesson.title}</span>
                {lesson.completed && <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="تکمیل‌شده" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
