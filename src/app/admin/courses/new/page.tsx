import type { Metadata } from "next";
import { CourseForm } from "@/components/admin/course-form";
import { requireAdmin } from "@/lib/auth-guards";

export const metadata: Metadata = { title: "دوره جدید", robots: { index: false } };

export default async function NewCoursePage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">دوره جدید</h1>
      <CourseForm courseId={null} />
    </div>
  );
}
