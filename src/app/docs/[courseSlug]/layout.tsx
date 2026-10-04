import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { MobileCourseNav } from "@/components/mobile-course-nav";
import { SidebarNav } from "@/components/sidebar-nav";
import { CourseSidebarHeader } from "@/components/course-sidebar-header";
import { getCurrentUser } from "@/lib/auth-guards";
import { getCompletedLessonIds, getCourseLessonList, getPublishedCourseBySlug } from "@/lib/queries";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug: rawSlug } = await params;
  const courseSlug = decodeURIComponent(rawSlug);
  const course = await getPublishedCourseBySlug(courseSlug);
  if (!course) notFound();

  const [list, user] = await Promise.all([getCourseLessonList(course.id), getCurrentUser()]);
  const done = user
    ? await getCompletedLessonIds(
        user.id,
        list.map((l) => l.id),
      )
    : new Set<string>();

  const sidebarLessons = list.map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    order: l.order,
    completed: done.has(l.id),
  }));

  const header = (
    <CourseSidebarHeader
      title={course.title}
      description={course.description}
      completed={done.size}
      total={list.length}
      showProgress={Boolean(user)}
    />
  );

  return (
    <div className="min-h-screen">
      <SiteHeader
        mobileNav={
          <MobileCourseNav courseSlug={course.slug} courseTitle={course.title} lessons={sidebarLessons} header={header} />
        }
      />
      <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] space-y-4 overflow-y-auto border-e p-4 lg:block">
          {header}
          <SidebarNav courseSlug={course.slug} lessons={sidebarLessons} />
        </aside>
        <main className="min-w-0 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
