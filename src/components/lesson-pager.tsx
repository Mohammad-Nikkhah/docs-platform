import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Target = { title: string; slug: string } | null;

/** RTL: "previous" sits on the right (start), "next" on the left (end). */
export function LessonPager({ courseSlug, prev, next }: { courseSlug: string; prev: Target; next: Target }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="پیمایش درس‌ها" className="mt-10 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link href={`/docs/${courseSlug}/${prev.slug}`} className="group rounded-lg border p-4 hover:border-accent">
          <span className="flex items-center gap-1 text-xs text-muted">
            <ArrowRight className="size-3.5" /> درس قبلی
          </span>
          <span className="mt-1 block font-medium group-hover:text-accent">{prev.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next && (
        <Link href={`/docs/${courseSlug}/${next.slug}`} className="group rounded-lg border p-4 text-end hover:border-accent">
          <span className="flex items-center justify-end gap-1 text-xs text-muted">
            درس بعدی <ArrowLeft className="size-3.5" />
          </span>
          <span className="mt-1 block font-medium group-hover:text-accent">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
