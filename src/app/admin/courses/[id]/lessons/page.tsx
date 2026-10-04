import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { SortableLessonList } from "@/components/admin/sortable-lesson-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth-guards";
import { getAdminCourse, getCourseLessonList } from "@/lib/queries";
import { uuidSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "درس‌های دوره", robots: { index: false } };

export default async function CourseLessonsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const course = await getAdminCourse(id);
  if (!course) notFound();
  const lessons = await getCourseLessonList(course.id, { publishedOnly: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">درس‌ها</h1>
          <p className="text-sm text-muted">{course.title} — برای تغییر ترتیب، درس‌ها را بکشید و رها کنید.</p>
        </div>
        <Button asChild>
          <Link href={`/admin/lessons/new?courseId=${course.id}`}>
            <Plus />
            درس جدید
          </Link>
        </Button>
      </div>
      {lessons.length === 0 ? (
        <EmptyState title="این دوره هنوز درسی ندارد" description="اولین درس را بسازید." />
      ) : (
        <SortableLessonList
          key={lessons.map((l) => `${l.id}:${l.published}:${l.title}`).join("|")}
          courseId={course.id}
          initialLessons={lessons.map((l) => ({ id: l.id, title: l.title, slug: l.slug, published: l.published }))}
        />
      )}
    </div>
  );
}
