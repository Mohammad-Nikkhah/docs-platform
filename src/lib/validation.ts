import { z } from "zod";

export const SLUG_REGEX = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;

export const slugSchema = z
  .string()
  .trim()
  .min(1, "اسلاگ الزامی است")
  .max(100, "اسلاگ بیش از حد طولانی است")
  .regex(SLUG_REGEX, "اسلاگ فقط می‌تواند شامل حروف، عدد و خط تیره باشد");

export const uuidSchema = z.string().uuid("شناسه نامعتبر است");

export const courseSchema = z.object({
  title: z.string().trim().min(2, "عنوان حداقل ۲ نویسه باشد").max(150),
  slug: slugSchema,
  description: z.string().trim().max(500, "توضیح حداکثر ۵۰۰ نویسه باشد").default(""),
  icon: z.string().trim().min(1).max(50).default("BookOpen"),
  published: z.boolean().default(false),
});
export type CourseInput = z.input<typeof courseSchema>;
export type CourseData = z.output<typeof courseSchema>;

// Tiptap JSON: validate shape loosely, size-limit to protect the DB.
const tiptapNodeSchema: z.ZodType<Record<string, unknown>> = z.lazy(() =>
  z
    .object({
      type: z.string().optional(),
      attrs: z.record(z.unknown()).optional(),
      content: z.array(tiptapNodeSchema).optional(),
      marks: z.array(z.record(z.unknown())).optional(),
      text: z.string().optional(),
    })
    .passthrough(),
);

export const tiptapDocSchema = z
  .object({ type: z.literal("doc"), content: z.array(tiptapNodeSchema).optional() })
  .passthrough()
  .refine((v) => JSON.stringify(v).length < 2_000_000, "محتوا بیش از حد بزرگ است");

export const lessonSchema = z.object({
  courseId: uuidSchema,
  title: z.string().trim().min(2, "عنوان حداقل ۲ نویسه باشد").max(150),
  slug: slugSchema,
  description: z.string().trim().max(300, "توضیح حداکثر ۳۰۰ نویسه باشد").default(""),
  content: tiptapDocSchema,
  order: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(false),
});
export type LessonData = z.output<typeof lessonSchema>;

export const progressSchema = z.object({
  lessonId: uuidSchema,
  completed: z.boolean(),
});

export const reorderSchema = z.object({
  courseId: uuidSchema,
  orderedIds: z.array(uuidSchema).min(1),
});

export const searchQuerySchema = z.string().trim().min(2).max(100);

export const loginRedirectSchema = z
  .string()
  .startsWith("/", "مسیر بازگشت نامعتبر است")
  .refine((v) => !v.startsWith("//"), "مسیر بازگشت نامعتبر است")
  .default("/dashboard");
