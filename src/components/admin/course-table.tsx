"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ListOrdered, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { deleteCourseAction, setCoursePublishedAction } from "@/actions/courses";
import { toPersianDigits } from "@/lib/utils";

type Row = { id: string; title: string; slug: string; published: boolean; lessonCount: number };

export function CourseTable({ courses }: { courses: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);

  function togglePublish(c: Row) {
    setError(null);
    startTransition(async () => {
      const res = await setCoursePublishedAction(c.id, !c.published);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  function confirmDelete() {
    if (!toDelete) return;
    const id = toDelete.id;
    startTransition(async () => {
      const res = await deleteCourseAction(id);
      if (!res.ok) setError(res.error);
      else router.refresh();
      setToDelete(null);
    });
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-3 rounded-md border border-danger/40 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">عنوان</th>
              <th className="px-4 py-3 text-start font-semibold">درس‌ها</th>
              <th className="px-4 py-3 text-start font-semibold">وضعیت</th>
              <th className="px-4 py-3 text-start font-semibold">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {courses.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{c.title}</p>
                  <p dir="ltr" className="text-start text-xs text-muted">
                    /{c.slug}
                  </p>
                </td>
                <td className="px-4 py-3">{toPersianDigits(c.lessonCount)}</td>
                <td className="px-4 py-3">
                  <Badge tone={c.published ? "success" : "muted"}>{c.published ? "منتشرشده" : "پیش‌نویس"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Button asChild size="icon" variant="ghost" title="درس‌ها و ترتیب">
                      <Link href={`/admin/courses/${c.id}/lessons`} aria-label="درس‌ها و ترتیب">
                        <ListOrdered />
                      </Link>
                    </Button>
                    <Button asChild size="icon" variant="ghost" title="ویرایش">
                      <Link href={`/admin/courses/${c.id}`} aria-label="ویرایش">
                        <Pencil />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => togglePublish(c)}
                      title={c.published ? "لغو انتشار" : "انتشار"}
                      aria-label={c.published ? "لغو انتشار" : "انتشار"}
                    >
                      {c.published ? <EyeOff /> : <Eye />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setToDelete(c)} title="حذف" aria-label="حذف" className="text-danger">
                      <Trash2 />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="حذف دوره"
        description={`دوره «${toDelete?.title ?? ""}» همراه با همه درس‌ها و پیشرفت کاربران حذف می‌شود. این کار قابل بازگشت نیست.`}
        pending={pending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
