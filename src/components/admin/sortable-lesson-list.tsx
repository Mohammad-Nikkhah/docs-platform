"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Eye, EyeOff, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { deleteLessonAction, duplicateLessonAction, reorderLessonsAction, setLessonPublishedAction } from "@/actions/lessons";
import { formatOrder } from "@/lib/utils";

type LessonRow = { id: string; title: string; slug: string; published: boolean };

function SortableRow({
  lesson,
  index,
  busy,
  onTogglePublish,
  onDuplicate,
  onDelete,
}: {
  lesson: LessonRow;
  index: number;
  busy: boolean;
  onTogglePublish: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 border-b bg-background px-3 py-2.5 last:border-b-0 ${isDragging ? "relative z-10 shadow-lg" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-muted hover:bg-surface active:cursor-grabbing"
        aria-label={`جابه‌جایی درس ${lesson.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <span dir="ltr" className="w-6 font-mono text-xs text-muted">
        {formatOrder(index + 1)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{lesson.title}</p>
        <p dir="ltr" className="truncate text-start text-xs text-muted">
          /{lesson.slug}
        </p>
      </div>
      <Badge tone={lesson.published ? "success" : "muted"} className="hidden sm:inline-flex">
        {lesson.published ? "منتشرشده" : "پیش‌نویس"}
      </Badge>
      <div className="flex">
        <Button asChild size="icon" variant="ghost" title="ویرایش">
          <Link href={`/admin/lessons/${lesson.id}/edit`} aria-label="ویرایش">
            <Pencil />
          </Link>
        </Button>
        <Button size="icon" variant="ghost" disabled={busy} onClick={onDuplicate} title="کپی" aria-label="کپی">
          <Copy />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled={busy}
          onClick={onTogglePublish}
          title={lesson.published ? "لغو انتشار" : "انتشار"}
          aria-label={lesson.published ? "لغو انتشار" : "انتشار"}
        >
          {lesson.published ? <EyeOff /> : <Eye />}
        </Button>
        <Button size="icon" variant="ghost" onClick={onDelete} title="حذف" aria-label="حذف" className="text-danger">
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}

export function SortableLessonList({ courseId, initialLessons }: { courseId: string; initialLessons: LessonRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialLessons);
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<LessonRow | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const previous = items;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, from, to);
    setItems(next); // optimistic
    setStatus({ kind: "ok", text: "در حال ذخیره..." });
    startTransition(async () => {
      const res = await reorderLessonsAction({ courseId, orderedIds: next.map((i) => i.id) });
      if (!res.ok) {
        setItems(previous);
        setStatus({ kind: "error", text: "ذخیره ناموفق بود" });
        return;
      }
      setStatus({ kind: "ok", text: "ذخیره شد" });
      router.refresh();
    });
  }

  function run(action: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    setStatus(null);
    startTransition(async () => {
      const res = await action();
      if (!res.ok) setStatus({ kind: "error", text: res.error ?? "عملیات ناموفق بود" });
      else {
        after?.();
        router.refresh();
      }
    });
  }

  // The parent remounts this component (via `key`) whenever server data changes.

  return (
    <>
      <p role="status" aria-live="polite" className={`mb-2 h-5 text-sm ${status?.kind === "error" ? "text-danger" : "text-muted"}`}>
        {status?.text}
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ol className="overflow-hidden rounded-lg border">
            {items.map((lesson, index) => (
              <SortableRow
                key={lesson.id}
                lesson={lesson}
                index={index}
                busy={pending}
                onTogglePublish={() => run(() => setLessonPublishedAction(lesson.id, !lesson.published))}
                onDuplicate={() => run(() => duplicateLessonAction(lesson.id))}
                onDelete={() => setToDelete(lesson)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="حذف درس"
        description={`درس «${toDelete?.title ?? ""}» و پیشرفت ثبت‌شده برای آن حذف می‌شود. این کار قابل بازگشت نیست.`}
        pending={pending}
        onConfirm={() => {
          const id = toDelete?.id;
          if (!id) return;
          run(() => deleteLessonAction(id), () => setToDelete(null));
        }}
      />
    </>
  );
}
