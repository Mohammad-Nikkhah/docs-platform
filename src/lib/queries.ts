import "server-only";
import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, lessons, progress, users } from "@/db/schema";
import { plainText, snippetAround } from "@/lib/tiptap-utils";

/* ───────── Public content ───────── */

export async function getPublishedCourses() {
  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      icon: courses.icon,
      lessonCount: sql<number>`(select count(*)::int from ${lessons} where ${lessons.courseId} = ${courses.id} and ${lessons.published} = true)`,
    })
    .from(courses)
    .where(eq(courses.published, true))
    .orderBy(asc(courses.createdAt));
  return rows;
}

export async function getPublishedCourseBySlug(slug: string) {
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.slug, slug), eq(courses.published, true)))
    .limit(1);
  return course ?? null;
}

export async function getCourseLessonList(courseId: string, opts: { publishedOnly: boolean } = { publishedOnly: true }) {
  return db
    .select({
      id: lessons.id,
      title: lessons.title,
      slug: lessons.slug,
      description: lessons.description,
      order: lessons.order,
      published: lessons.published,
    })
    .from(lessons)
    .where(
      opts.publishedOnly
        ? and(eq(lessons.courseId, courseId), eq(lessons.published, true))
        : eq(lessons.courseId, courseId),
    )
    .orderBy(asc(lessons.order), asc(lessons.createdAt));
}

export async function getPublishedLesson(courseId: string, lessonSlug: string) {
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.courseId, courseId), eq(lessons.slug, lessonSlug), eq(lessons.published, true)))
    .limit(1);
  return lesson ?? null;
}

export async function getLatestLessons(limit = 6) {
  return db
    .select({
      id: lessons.id,
      title: lessons.title,
      slug: lessons.slug,
      description: lessons.description,
      courseSlug: courses.slug,
      courseTitle: courses.title,
    })
    .from(lessons)
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .where(and(eq(lessons.published, true), eq(courses.published, true)))
    .orderBy(desc(lessons.createdAt))
    .limit(limit);
}

export async function getFirstLessonSlug(courseId: string) {
  const [first] = await db
    .select({ slug: lessons.slug })
    .from(lessons)
    .where(and(eq(lessons.courseId, courseId), eq(lessons.published, true)))
    .orderBy(asc(lessons.order))
    .limit(1);
  return first?.slug ?? null;
}

/* ───────── Progress ───────── */

export async function getCompletedLessonIds(userId: string, lessonIds: string[]): Promise<Set<string>> {
  if (lessonIds.length === 0) return new Set();
  const rows = await db
    .select({ lessonId: progress.lessonId })
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.completed, true), inArray(progress.lessonId, lessonIds)));
  return new Set(rows.map((r) => r.lessonId));
}

export async function getUserCourseProgress(userId: string) {
  const published = await getPublishedCourses();
  const result = [] as {
    courseId: string;
    title: string;
    slug: string;
    icon: string;
    total: number;
    completed: number;
    nextLessonSlug: string | null;
  }[];

  for (const course of published) {
    const list = await getCourseLessonList(course.id);
    const done = await getCompletedLessonIds(
      userId,
      list.map((l) => l.id),
    );
    const next = list.find((l) => !done.has(l.id)) ?? list[0];
    result.push({
      courseId: course.id,
      title: course.title,
      slug: course.slug,
      icon: course.icon,
      total: list.length,
      completed: done.size,
      nextLessonSlug: next?.slug ?? null,
    });
  }
  return result;
}

/* ───────── Search ───────── */

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export type SearchResult = {
  lessonId: string;
  courseTitle: string;
  courseSlug: string;
  lessonTitle: string;
  lessonSlug: string;
  preview: string;
};

export async function searchContent(query: string, limit = 12): Promise<SearchResult[]> {
  const pattern = `%${escapeLike(query)}%`;
  const rows = await db
    .select({
      lessonId: lessons.id,
      lessonTitle: lessons.title,
      lessonSlug: lessons.slug,
      description: lessons.description,
      content: lessons.content,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    })
    .from(lessons)
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .where(
      and(
        eq(lessons.published, true),
        eq(courses.published, true),
        or(
          ilike(lessons.title, pattern),
          ilike(lessons.description, pattern),
          ilike(courses.title, pattern),
          ilike(courses.description, pattern),
          sql`${lessons.content}::text ilike ${pattern}`,
        ),
      ),
    )
    .orderBy(asc(courses.title), asc(lessons.order))
    .limit(limit);

  return rows.map((r) => {
    const text = plainText(r.content);
    const inText = text.toLowerCase().includes(query.toLowerCase());
    return {
      lessonId: r.lessonId,
      courseTitle: r.courseTitle,
      courseSlug: r.courseSlug,
      lessonTitle: r.lessonTitle,
      lessonSlug: r.lessonSlug,
      preview: inText ? snippetAround(text, query) : r.description || text.slice(0, 140),
    };
  });
}

/* ───────── Admin ───────── */

export async function getAdminStats() {
  const [[c], [cp], [l], [lp], [u]] = await Promise.all([
    db.select({ n: count() }).from(courses),
    db.select({ n: count() }).from(courses).where(eq(courses.published, true)),
    db.select({ n: count() }).from(lessons),
    db.select({ n: count() }).from(lessons).where(eq(lessons.published, true)),
    db.select({ n: count() }).from(users),
  ]);
  return {
    courses: c?.n ?? 0,
    publishedCourses: cp?.n ?? 0,
    lessons: l?.n ?? 0,
    publishedLessons: lp?.n ?? 0,
    users: u?.n ?? 0,
  };
}

export async function getAdminCourses() {
  return db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      published: courses.published,
      updatedAt: courses.updatedAt,
      lessonCount: sql<number>`(select count(*)::int from ${lessons} where ${lessons.courseId} = ${courses.id})`,
    })
    .from(courses)
    .orderBy(desc(courses.updatedAt));
}

export async function getAdminCourse(id: string) {
  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return course ?? null;
}

export async function getAdminLesson(id: string) {
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return lesson ?? null;
}

export async function getAdminCourseOptions() {
  return db.select({ id: courses.id, title: courses.title }).from(courses).orderBy(asc(courses.title));
}
