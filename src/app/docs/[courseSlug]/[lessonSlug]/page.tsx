import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { CompleteButton } from "@/components/complete-button";
import { LessonContent } from "@/components/lesson-content";
import { LessonPager } from "@/components/lesson-pager";
import { TableOfContents } from "@/components/table-of-contents";
import { getCurrentUser } from "@/lib/auth-guards";
import { getCompletedLessonIds, getCourseLessonList, getPublishedCourseBySlug, getPublishedLesson } from "@/lib/queries";
import { extractHeadings } from "@/lib/tiptap-utils";
import { siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ courseSlug: string; lessonSlug: string }> };

async function load(courseSlugRaw: string, lessonSlugRaw: string) {
  const courseSlug = decodeURIComponent(courseSlugRaw);
  const lessonSlug = decodeURIComponent(lessonSlugRaw);
  const course = await getPublishedCourseBySlug(courseSlug);
  if (!course) return null;
  const lesson = await getPublishedLesson(course.id, lessonSlug);
  if (!lesson) return null;
  return { course, lesson };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const data = await load(p.courseSlug, p.lessonSlug);
  if (!data) return {};
  const { course, lesson } = data;
  const url = `${siteUrl()}/docs/${encodeURIComponent(course.slug)}/${encodeURIComponent(lesson.slug)}`;
  const description = lesson.description || course.description;
  return {
    title: `${lesson.title} · ${course.title}`,
    description,
    alternates: { canonical: url },
    openGraph: { title: lesson.title, description, url, type: "article", siteName: course.title },
  };
}

export default async function LessonPage({ params }: Props) {
  const p = await params;
  const data = await load(p.courseSlug, p.lessonSlug);
  if (!data) notFound();
  const { course, lesson } = data;

  const [list, user] = await Promise.all([getCourseLessonList(course.id), getCurrentUser()]);
  const index = list.findIndex((l) => l.id === lesson.id);
  const prev = index > 0 ? (list[index - 1] ?? null) : null;
  const next = index >= 0 && index < list.length - 1 ? (list[index + 1] ?? null) : null;
  const done = user ? await getCompletedLessonIds(user.id, [lesson.id]) : new Set<string>();
  const headings = extractHeadings(lesson.content);
  const path = `/docs/${course.slug}/${lesson.slug}`;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_14rem]">
      <TableOfContents headings={headings} />
      <article className="mx-auto w-full min-w-0 max-w-3xl">
        <Breadcrumb
          items={[
            { label: "دوره‌ها", href: "/docs" },
            { label: course.title, href: `/docs/${course.slug}` },
            { label: lesson.title },
          ]}
        />
        <h1 className="text-3xl font-bold leading-snug">{lesson.title}</h1>
        {lesson.description && <p className="mt-2 text-muted">{lesson.description}</p>}

        <div className="mt-8">
          <LessonContent content={lesson.content} />
        </div>

        <div className="mt-12 border-t pt-8">
          <CompleteButton lessonId={lesson.id} initialCompleted={done.has(lesson.id)} signedIn={Boolean(user)} callbackPath={path} />
        </div>

        <LessonPager
          courseSlug={course.slug}
          prev={prev ? { title: prev.title, slug: prev.slug } : null}
          next={next ? { title: next.title, slug: next.slug } : null}
        />
      </article>
    </div>
  );
}
