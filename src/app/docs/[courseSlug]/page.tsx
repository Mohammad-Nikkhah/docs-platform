import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import { EmptyState } from "@/components/ui/card";
import { getCourseLessonList, getPublishedCourseBySlug } from "@/lib/queries";
import { formatOrder, siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ courseSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent((await params).courseSlug);
  const course = await getPublishedCourseBySlug(slug);
  if (!course) return {};
  const url = `${siteUrl()}/docs/${encodeURIComponent(course.slug)}`;
  return {
    title: course.title,
    description: course.description,
    alternates: { canonical: url },
    openGraph: { title: course.title, description: course.description, url, type: "website" },
  };
}

export default async function CoursePage({ params }: Props) {
  const slug = decodeURIComponent((await params).courseSlug);
  const course = await getPublishedCourseBySlug(slug);
  if (!course) notFound();
  const list = await getCourseLessonList(course.id);

  return (
    <article className="mx-auto max-w-3xl">
      <Breadcrumb items={[{ label: "دوره‌ها", href: "/docs" }, { label: course.title }]} />
      <h1 className="text-3xl font-bold">{course.title}</h1>
      {course.description && <p className="mt-3 text-muted">{course.description}</p>}

      {list.length > 0 && (
        <Button asChild className="mt-6" size="lg">
          <Link href={`/docs/${course.slug}/${list[0]?.slug}`}>شروع یادگیری</Link>
        </Button>
      )}

      <h2 className="mb-3 mt-10 text-xl font-bold">سرفصل‌ها</h2>
      {list.length === 0 ? (
        <EmptyState title="هنوز درسی منتشر نشده است" description="به زودی درس‌های این دوره اضافه می‌شود." />
      ) : (
        <ol className="divide-y rounded-lg border">
          {list.map((l, i) => (
            <li key={l.id}>
              <Link href={`/docs/${course.slug}/${l.slug}`} className="flex items-start gap-4 px-4 py-3 hover:bg-surface">
                <span dir="ltr" className="mt-0.5 font-mono text-sm text-muted">
                  {formatOrder(i + 1)}
                </span>
                <span>
                  <span className="block font-medium">{l.title}</span>
                  {l.description && <span className="text-sm text-muted">{l.description}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
