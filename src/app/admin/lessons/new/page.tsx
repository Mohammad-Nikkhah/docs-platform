import type { Metadata } from "next";
import { LessonForm } from "@/components/admin/lesson-form";
import { requireAdmin } from "@/lib/auth-guards";
import { getAdminCourseOptions } from "@/lib/queries";
import { emptyDoc } from "@/lib/tiptap-helpers";
import { uuidSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "درس جدید", robots: { index: false } };

export default async function NewLessonPage({ searchParams }: { searchParams: Promise<{ courseId?: string }> }) {
  await requireAdmin();
  const { courseId } = await searchParams;
  const courses = await getAdminCourseOptions();
  const preselected = courseId && uuidSchema.safeParse(courseId).success ? courseId : "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">درس جدید</h1>
      <LessonForm
        lessonId={null}
        courses={courses}
        initial={{ courseId: preselected, title: "", slug: "", description: "", content: emptyDoc() as never, order: 0, published: false }}
      />
    </div>
  );
}
