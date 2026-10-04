import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CourseTable } from "@/components/admin/course-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth-guards";
import { getAdminCourses } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "مدیریت دوره‌ها", robots: { index: false } };

export default async function AdminCoursesPage() {
  await requireAdmin();
  const courses = await getAdminCourses();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">دوره‌ها</h1>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus />
            دوره جدید
          </Link>
        </Button>
      </div>
      {courses.length === 0 ? (
        <EmptyState title="هنوز دوره‌ای ساخته نشده است" description="اولین دوره را ایجاد کنید." />
      ) : (
        <CourseTable courses={courses} />
      )}
    </div>
  );
}
