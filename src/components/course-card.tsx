import Link from "next/link";
import { CourseIcon } from "@/components/course-icon";

export type CourseCardData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  lessonCount: number;
};

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/docs/${course.slug}`}
      className="group flex flex-col gap-3 rounded-lg border bg-surface p-5 transition-colors hover:border-accent"
    >
      <span className="flex size-10 items-center justify-center rounded-md border bg-background text-accent">
        <CourseIcon name={course.icon} className="size-5" />
      </span>
      <span className="text-lg font-semibold group-hover:text-accent">{course.title}</span>
      <span className="line-clamp-2 flex-1 text-sm text-muted">{course.description}</span>
      <span className="text-xs text-muted">{course.lessonCount} درس</span>
    </Link>
  );
}
