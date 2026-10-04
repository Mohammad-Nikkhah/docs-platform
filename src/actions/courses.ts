"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { AuthError, assertAdmin } from "@/lib/auth-guards";
import { courseSchema, uuidSchema, type CourseInput } from "@/lib/validation";
import { fail, isUniqueViolation, type ActionResult } from "@/lib/action-result";

function revalidateCourse() {
  revalidatePath("/", "layout");
}

export async function saveCourseAction(id: string | null, input: CourseInput): Promise<ActionResult<{ id: string }>> {
  try {
    await assertAdmin();
    const parsed = courseSchema.safeParse(input);
    if (!parsed.success) return fail("اطلاعات نامعتبر است", parsed.error.flatten().fieldErrors);

    if (id) {
      if (!uuidSchema.safeParse(id).success) return fail("شناسه نامعتبر است");
      const [row] = await db.update(courses).set(parsed.data).where(eq(courses.id, id)).returning({ id: courses.id });
      if (!row) return fail("دوره پیدا نشد");
      revalidateCourse();
      return { ok: true, data: { id: row.id } };
    }

    const [row] = await db.insert(courses).values(parsed.data).returning({ id: courses.id });
    if (!row) return fail("ایجاد دوره ناموفق بود");
    revalidateCourse();
    return { ok: true, data: { id: row.id } };
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message);
    if (isUniqueViolation(err)) return fail("این اسلاگ قبلاً استفاده شده است", { slug: ["اسلاگ تکراری است"] });
    console.error("saveCourseAction", err);
    return fail("خطای غیرمنتظره رخ داد");
  }
}

export async function setCoursePublishedAction(id: string, published: boolean): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!uuidSchema.safeParse(id).success) return fail("شناسه نامعتبر است");
    await db.update(courses).set({ published }).where(eq(courses.id, id));
    revalidateCourse();
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message);
    console.error("setCoursePublishedAction", err);
    return fail("خطای غیرمنتظره رخ داد");
  }
}

export async function deleteCourseAction(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!uuidSchema.safeParse(id).success) return fail("شناسه نامعتبر است");
    await db.delete(courses).where(eq(courses.id, id)); // lessons/progress cascade
    revalidateCourse();
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message);
    console.error("deleteCourseAction", err);
    return fail("خطای غیرمنتظره رخ داد");
  }
}
