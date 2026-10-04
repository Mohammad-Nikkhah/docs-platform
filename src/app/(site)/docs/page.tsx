import type { Metadata } from "next";
import { CourseCard } from "@/components/course-card";
import { EmptyState } from "@/components/ui/card";
import { getPublishedCourses } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "دوره‌ها", description: "فهرست دوره‌های آموزشی" };

export default async function DocsIndexPage() {
  const courses = await getPublishedCourses();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">دوره‌ها</h1>
      <p className="mt-2 text-muted">یکی از دوره‌ها را انتخاب کن و یادگیری را شروع کن.</p>
      <div className="mt-8">
        {courses.length === 0 ? (
          <EmptyState title="هنوز دوره‌ای منتشر نشده است" description="به زودی دوره‌های جدید اضافه می‌شود." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
