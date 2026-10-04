import type { Metadata } from "next";
import Link from "next/link";
import { CourseIcon } from "@/components/course-icon";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, ProgressBar } from "@/components/ui/card";
import { requireUser } from "@/lib/auth-guards";
import { getUserCourseProgress } from "@/lib/queries";
import { percent, toPersianDigits } from "@/lib/utils";

export const metadata: Metadata = { title: "داشبورد", robots: { index: false } };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const courses = await getUserCourseProgress(user.id);
  const totalDone = courses.reduce((s, c) => s + c.completed, 0);
  const totalLessons = courses.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">سلام{user.name ? `، ${user.name}` : ""}</h1>
        <p className="mt-1 text-sm text-muted">
          {toPersianDigits(totalDone)} درس از {toPersianDigits(totalLessons)} درس را کامل کرده‌ای.
        </p>
      </div>

      <section aria-labelledby="my-courses">
        <h2 id="my-courses" className="mb-4 text-lg font-bold">
          دوره‌های من
        </h2>
        {courses.length === 0 ? (
          <EmptyState title="هنوز دوره‌ای منتشر نشده است" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((c) => {
              const pct = percent(c.completed, c.total);
              return (
                <Card key={c.courseId} className="space-y-4 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-md border bg-background text-accent">
                      <CourseIcon name={c.icon} className="size-4" />
                    </span>
                    <h3 className="font-semibold">{c.title}</h3>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted">
                      <span>
                        {toPersianDigits(c.completed)} از {toPersianDigits(c.total)} درس
                      </span>
                      <span>{toPersianDigits(pct)}٪</span>
                    </div>
                    <ProgressBar value={pct} label={`پیشرفت ${c.title}`} />
                  </div>
                  {c.nextLessonSlug && (
                    <Button asChild size="sm" variant={pct === 100 ? "outline" : "default"}>
                      <Link href={`/docs/${c.slug}/${c.nextLessonSlug}`}>{pct === 0 ? "شروع دوره" : pct === 100 ? "مرور دوره" : "ادامه یادگیری"}</Link>
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
