import Link from "next/link";
import { FileText, ListChecks, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { EmptyState } from "@/components/ui/card";
import { getFirstLessonSlug, getLatestLessons, getPublishedCourses } from "@/lib/queries";

export const dynamic = "force-dynamic";

const features = [
  { Icon: ListChecks, title: "مرحله‌به‌مرحله", text: "درس‌ها به ترتیب و با پیشرفت قابل پیگیری ارائه می‌شوند." },
  { Icon: Search, title: "جستجوی سریع", text: "با Ctrl/Cmd + K در همه درس‌ها جستجو کن." },
  { Icon: FileText, title: "ساده و کاربردی", text: "محتوا مثل مستندات توسعه‌دهندگان: تمیز، کدمحور و بدون شلوغی." },
];

export default async function HomePage() {
  const [courses, latest] = await Promise.all([getPublishedCourses(), getLatestLessons(6)]);
  const first = courses[0];
  const firstLesson = first ? await getFirstLessonSlug(first.id) : null;
  const startHref = first && firstLesson ? `/docs/${first.slug}/${firstLesson}` : "/docs";

  return (
    <main>
      <section className="border-b">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">یادگیری، مستند و مرحله‌به‌مرحله</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">دوره‌ها و درس‌های فنی را با ساختاری ساده و کاربردی یاد بگیر.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={startHref}>شروع یادگیری</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/docs">مشاهده دوره‌ها</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-14">
        <section aria-labelledby="popular">
          <h2 id="popular" className="mb-5 text-2xl font-bold">
            دوره‌های محبوب
          </h2>
          {courses.length === 0 ? (
            <EmptyState title="هنوز دوره‌ای منتشر نشده است" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="latest">
          <h2 id="latest" className="mb-5 text-2xl font-bold">
            آخرین درس‌ها
          </h2>
          {latest.length === 0 ? (
            <EmptyState title="هنوز درسی منتشر نشده است" />
          ) : (
            <ul className="divide-y rounded-lg border">
              {latest.map((l) => (
                <li key={l.id}>
                  <Link href={`/docs/${l.courseSlug}/${l.slug}`} className="flex flex-col gap-0.5 px-4 py-3 hover:bg-surface">
                    <span className="text-xs text-muted">{l.courseTitle}</span>
                    <span className="font-medium">{l.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="about">
          <h2 id="about" className="sr-only">
            درباره پلتفرم
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(({ Icon, title, text }) => (
              <div key={title} className="rounded-lg border p-5">
                <Icon className="mb-3 size-6 text-accent" aria-hidden />
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
