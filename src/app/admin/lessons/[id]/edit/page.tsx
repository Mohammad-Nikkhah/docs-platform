import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonForm } from "@/components/admin/lesson-form";
import { requireAdmin } from "@/lib/auth-guards";
import { getAdminCourseOptions, getAdminLesson } from "@/lib/queries";
import { uuidSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ویرایش درس", robots: { index: false } };

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const [lesson, courses] = await Promise.all([getAdminLesson(id), getAdminCourseOptions()]);
  if (!lesson) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ویرایش درس</h1>
      <LessonForm
        lessonId={lesson.id}
        courses={courses}
        initial={{
          courseId: lesson.courseId,
          title: lesson.title,
          slug: lesson.slug,
          description: lesson.description,
          content: lesson.content as never,
          order: lesson.order,
          published: lesson.published,
        }}
      />
    </div>
  );
}
