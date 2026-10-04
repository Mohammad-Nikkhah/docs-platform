"use server";

import { and, desc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { AuthError, assertAdmin } from "@/lib/auth-guards";
import { lessonSchema, reorderSchema, uuidSchema } from "@/lib/validation";
import { fail, isUniqueViolation, type ActionResult } from "@/lib/action-result";

export type LessonInput = Parameters<typeof lessonSchema.safeParse>[0];

function revalidateLessons() {
  revalidatePath("/", "layout");
}

async function nextOrder(courseId: string): Promise<number> {
  const [row] = await db.select({ m: max(lessons.order) }).from(lessons).where(eq(lessons.courseId, courseId));
  return (row?.m ?? 0) + 1;
}

export async function saveLessonAction(id: string | null, input: LessonInput): Promise<ActionResult<{ id: string }>> {
  try {
    await assertAdmin();
    const parsed = lessonSchema.safeParse(input);
    if (!parsed.success) return fail("اطلاعات نامعتبر است", parsed.error.flatten().fieldErrors);
    const data = parsed.data as typeof parsed.data & { content: typeof lessons.$inferInsert.content };

    if (id) {
      if (!uuidSchema.safeParse(id).success) return fail("شناسه نامعتبر است");
      // `order` is managed only by drag & drop (reorderLessonsAction), never by the edit form.
      const { order: _ignored, ...changes } = data;
      void _ignored;
      const [row] = await db.update(lessons).set(changes).where(eq(lessons.id, id)).returning({ id: lessons.id });
      if (!row) return fail("درس پیدا نشد");
      revalidateLessons();
      return { ok: true, data: { id: row.id } };
    }

    const order = data.order > 0 ? data.order : await nextOrder(data.courseId);
    const [row] = await db.insert(lessons).values({ ...data, order }).returning({ id: lessons.id });
    if (!row) return fail("ایجاد درس ناموفق بود");
    revalidateLessons();
    return { ok: true, data: { id: row.id } };
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message);
    if (isUniqueViolation(err)) return fail("این اسلاگ در این دوره قبلاً استفاده شده است", { slug: ["اسلاگ تکراری است"] });
    console.error("saveLessonAction", err);
    return fail("ذخیره ناموفق بود");
  }
}

export async function setLessonPublishedAction(id: string, published: boolean): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!uuidSchema.safeParse(id).success) return fail("شناسه نامعتبر است");
    await db.update(lessons).set({ published }).where(eq(lessons.id, id));
    revalidateLessons();
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message);
    console.error("setLessonPublishedAction", err);
    return fail("خطای غیرمنتظره رخ داد");
  }
}

export async function deleteLessonAction(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!uuidSchema.safeParse(id).success) return fail("شناسه نامعتبر است");
    await db.delete(lessons).where(eq(lessons.id, id));
    revalidateLessons();
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message);
    console.error("deleteLessonAction", err);
    return fail("خطای غیرمنتظره رخ داد");
  }
}

export async function duplicateLessonAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await assertAdmin();
    if (!uuidSchema.safeParse(id).success) return fail("شناسه نامعتبر است");
    const [src] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
    if (!src) return fail("درس پیدا نشد");

    // find a free slug: <slug>-copy, <slug>-copy-2, ...
    const existing = await db
      .select({ slug: lessons.slug })
      .from(lessons)
      .where(and(eq(lessons.courseId, src.courseId)))
      .orderBy(desc(lessons.createdAt));
    const taken = new Set(existing.map((e) => e.slug));
    let slug = `${src.slug}-copy`;
    for (let i = 2; taken.has(slug); i++) slug = `${src.slug}-copy-${i}`;

    const [row] = await db
      .insert(lessons)
      .values({
        courseId: src.courseId,
        title: `${src.title} (کپی)`,
        slug,
        description: src.description,
        content: src.content,
        order: await nextOrder(src.courseId),
        published: false,
      })
      .returning({ id: lessons.id });
    if (!row) return fail("کپی درس ناموفق بود");
    revalidateLessons();
    return { ok: true, data: { id: row.id } };
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message);
    console.error("duplicateLessonAction", err);
    return fail("خطای غیرمنتظره رخ داد");
  }
}

export async function reorderLessonsAction(input: unknown): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = reorderSchema.safeParse(input);
    if (!parsed.success) return fail("اطلاعات نامعتبر است");
    const { courseId, orderedIds } = parsed.data;

    await db.transaction(async (tx) => {
      for (const [index, lessonId] of orderedIds.entries()) {
        await tx
          .update(lessons)
          .set({ order: index + 1 })
          .where(and(eq(lessons.id, lessonId), eq(lessons.courseId, courseId)));
      }
    });
    revalidateLessons();
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message);
    console.error("reorderLessonsAction", err);
    return fail("تغییر ترتیب ناموفق بود");
  }
}
