"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { lessons, progress } from "@/db/schema";
import { AuthError, assertUser } from "@/lib/auth-guards";
import { progressSchema, searchQuerySchema } from "@/lib/validation";
import { fail, type ActionResult } from "@/lib/action-result";
import { searchContent, type SearchResult } from "@/lib/queries";

export async function setLessonCompletedAction(input: unknown): Promise<ActionResult> {
  try {
    const user = await assertUser();
    const parsed = progressSchema.safeParse(input);
    if (!parsed.success) return fail("اطلاعات نامعتبر است");
    const { lessonId, completed } = parsed.data;

    // only published lessons can be tracked
    const [lesson] = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.published, true)))
      .limit(1);
    if (!lesson) return fail("درس پیدا نشد");

    await db
      .insert(progress)
      .values({ userId: user.id, lessonId, completed })
      .onConflictDoUpdate({ target: [progress.userId, progress.lessonId], set: { completed, updatedAt: new Date() } });

    revalidatePath("/docs", "layout");
    revalidatePath("/dashboard", "layout");
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message);
    console.error("setLessonCompletedAction", err);
    return fail("ذخیره پیشرفت ناموفق بود");
  }
}

export async function searchAction(query: string): Promise<SearchResult[]> {
  const parsed = searchQuerySchema.safeParse(query);
  if (!parsed.success) return [];
  try {
    return await searchContent(parsed.data);
  } catch (err) {
    console.error("searchAction", err);
    return [];
  }
}
