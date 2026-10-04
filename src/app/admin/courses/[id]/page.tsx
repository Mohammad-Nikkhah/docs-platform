import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth-guards";
import { getAdminCourse } from "@/lib/queries";
import { uuidSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ویرایش دوره", robots: { index: false } };

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const course = await getAdminCourse(id);
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">ویرایش دوره</h1>
        <Button asChild variant="outline">
          <Link href={`/admin/courses/${course.id}/lessons`}>درس‌ها و ترتیب</Link>
        </Button>
      </div>
      <CourseForm
        courseId={course.id}
        initial={{
          title: course.title,
          slug: course.slug,
          description: course.description,
          icon: course.icon,
          published: course.published,
        }}
      />
    </div>
  );
}
