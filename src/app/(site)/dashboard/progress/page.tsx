import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, ProgressBar } from "@/components/ui/card";
import { requireUser } from "@/lib/auth-guards";
import { getUserCourseProgress } from "@/lib/queries";
import { percent, toPersianDigits } from "@/lib/utils";

export const metadata: Metadata = { title: "پیشرفت من", robots: { index: false } };

export default async function ProgressPage() {
  const user = await requireUser("/dashboard/progress");
  const courses = await getUserCourseProgress(user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">پیشرفت من</h1>
      {courses.length === 0 ? (
        <EmptyState title="هنوز دوره‌ای منتشر نشده است" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-start">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">دوره</th>
                <th className="px-4 py-3 text-start font-semibold">پیشرفت</th>
                <th className="px-4 py-3 text-start font-semibold">درس‌های تکمیل‌شده</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses.map((c) => {
                const pct = percent(c.completed, c.total);
                return (
                  <tr key={c.courseId}>
                    <td className="px-4 py-3">
                      <Link href={`/docs/${c.slug}`} className="font-medium hover:text-accent">
                        {c.title}
                      </Link>
                    </td>
                    <td className="min-w-40 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={pct} label={`پیشرفت ${c.title}`} />
                        <span className="w-10 text-xs text-muted">{toPersianDigits(pct)}٪</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {toPersianDigits(c.completed)} / {toPersianDigits(c.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
