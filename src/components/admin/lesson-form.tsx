"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { JSONContent } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { LessonEditor } from "@/components/editor/lesson-editor";
import { saveLessonAction } from "@/actions/lessons";
import { lessonSchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import type { z } from "zod";

type FormInput = z.input<typeof lessonSchema>;
type SaveStatus = "idle" | "saving" | "saved" | "error";

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: "",
  saving: "در حال ذخیره...",
  saved: "ذخیره شد",
  error: "ذخیره ناموفق بود",
};

export function LessonForm({
  lessonId,
  courses,
  initial,
}: {
  lessonId: string | null;
  courses: { id: string; title: string }[];
  initial: FormInput;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [content, setContent] = useState<JSONContent>(initial.content as JSONContent);
  const [slugTouched, setSlugTouched] = useState(Boolean(lessonId));
  const lastSaved = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(lessonSchema),
    defaultValues: initial,
  });

  const titleField = register("title");
  const values = watch();
  const snapshot = JSON.stringify({ ...values, content });

  useEffect(() => {
    if (lastSaved.current === null) lastSaved.current = snapshot; // baseline = loaded state
  }, [snapshot]);

  async function persist(payload: FormInput): Promise<boolean> {
    const res = await saveLessonAction(lessonId, payload);
    if (!res.ok) {
      setFormError(res.error);
      for (const [field, messages] of Object.entries(res.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message && field !== "content") setError(field as keyof FormInput, { message });
      }
      return false;
    }
    if (!lessonId) router.replace(`/admin/lessons/${res.data.id}/edit`);
    return true;
  }

  // Autosave for existing lessons: debounce, validate locally, skip while invalid.
  useEffect(() => {
    if (!lessonId || lastSaved.current === null || snapshot === lastSaved.current || status === "saving") return;
    const payload = { ...values, content: content as FormInput["content"] };
    if (!lessonSchema.safeParse(payload).success) return;

    const timer = setTimeout(async () => {
      setStatus("saving");
      setFormError(null);
      const ok = await persist(payload);
      if (ok) lastSaved.current = JSON.stringify(payload);
      setStatus(ok ? "saved" : "error");
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot, status, lessonId]);

  function onSubmit(data: FormInput) {
    setFormError(null);
    setStatus("saving");
    startTransition(async () => {
      const payload = { ...data, content: content as FormInput["content"] };
      const ok = await persist(payload);
      if (ok) lastSaved.current = JSON.stringify({ ...payload });
      setStatus(ok ? "saved" : "error");
    });
  }

  const statusText = STATUS_TEXT[status];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="courseId">دوره</Label>
          <select
            id="courseId"
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            aria-invalid={Boolean(errors.courseId)}
            {...register("courseId")}
          >
            <option value="">انتخاب دوره...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <FieldError message={errors.courseId?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">عنوان</Label>
          <Input
            id="title"
            aria-invalid={Boolean(errors.title)}
            {...titleField}
            onChange={(e) => {
              void titleField.onChange(e);
              if (!slugTouched) setValue("slug", slugify(e.target.value));
            }}
          />
          <FieldError message={errors.title?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">اسلاگ (آدرس)</Label>
          <Input id="slug" dir="ltr" aria-invalid={Boolean(errors.slug)} {...register("slug", { onChange: () => setSlugTouched(true) })} />
          <FieldError message={errors.slug?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">توضیح کوتاه</Label>
          <Textarea id="description" className="min-h-9" aria-invalid={Boolean(errors.description)} {...register("description")} />
          <FieldError message={errors.description?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>محتوا</Label>
        <LessonEditor initialContent={initial.content as JSONContent} onChange={setContent} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-[var(--accent)]" {...register("published")} />
        منتشر شود
      </label>

      {formError && (
        <p role="alert" className="rounded-md border border-danger/40 px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      )}

      <div className="sticky bottom-0 -mx-1 flex items-center gap-3 border-t bg-background/95 px-1 py-3 backdrop-blur">
        <Button type="submit" disabled={pending || status === "saving"}>
          {lessonId ? "ذخیره" : "ایجاد درس"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          بازگشت
        </Button>
        <span
          role="status"
          aria-live="polite"
          className={cn("text-sm", status === "error" ? "text-danger" : status === "saved" ? "text-success" : "text-muted")}
        >
          {statusText}
        </span>
        {lessonId && <span className="ms-auto hidden text-xs text-muted sm:inline">ذخیره خودکار فعال است</span>}
      </div>
    </form>
  );
}
