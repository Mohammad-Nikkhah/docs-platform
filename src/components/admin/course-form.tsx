"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { COURSE_ICON_NAMES, CourseIcon } from "@/components/course-icon";
import { saveCourseAction } from "@/actions/courses";
import { courseSchema, type CourseData, type CourseInput } from "@/lib/validation";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";

export function CourseForm({ courseId, initial }: { courseId: string | null; initial?: CourseInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // Suggest slug from title until the admin edits the slug by hand.
  const [slugTouched, setSlugTouched] = useState(Boolean(courseId));

  const defaultValues: CourseData = {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    icon: initial?.icon ?? "BookOpen",
    published: initial?.published ?? false,
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues,
  });

  const titleField = register("title");

  function onSubmit(values: CourseInput) {
    setFormError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await saveCourseAction(courseId, values);
      if (!res.ok) {
        setFormError(res.error);
        for (const [field, messages] of Object.entries(res.fieldErrors ?? {})) {
          const message = messages?.[0];
          if (message && field in values) setError(field as keyof CourseData, { message });
        }
        return;
      }
      setSaved(true);
      if (!courseId) router.replace(`/admin/courses/${res.data.id}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="title">عنوان</Label>
        <Input
          id="title"
          aria-invalid={Boolean(errors.title)}
          {...titleField}
          onChange={(e) => {
            void titleField.onChange(e);
            if (!slugTouched) setValue("slug", slugify(e.target.value), { shouldValidate: false });
          }}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">اسلاگ (آدرس)</Label>
        <Input
          id="slug"
          dir="ltr"
          aria-invalid={Boolean(errors.slug)}
          {...register("slug", { onChange: () => setSlugTouched(true) })}
        />
        <FieldError message={errors.slug?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">توضیح کوتاه</Label>
        <Textarea id="description" aria-invalid={Boolean(errors.description)} {...register("description")} />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="space-y-1.5">
        <Label>آیکون</Label>
        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <div role="radiogroup" aria-label="آیکون" className="flex flex-wrap gap-2">
              {COURSE_ICON_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={field.value === name}
                  aria-label={name}
                  title={name}
                  onClick={() => field.onChange(name)}
                  className={cn("flex size-10 items-center justify-center rounded-md border hover:bg-surface", field.value === name && "border-accent text-accent")}
                >
                  <CourseIcon name={name} className="size-5" />
                </button>
              ))}
            </div>
          )}
        />
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
      {saved && !formError && (
        <p role="status" className="text-sm text-success">
          ذخیره شد
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "در حال ذخیره..." : "ذخیره"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/courses")}>
          بازگشت
        </Button>
      </div>
    </form>
  );
}
