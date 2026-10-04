"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { BookOpen, FileText, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { searchAction } from "@/actions/progress";
import type { SearchResult } from "@/lib/queries";

export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [pending, startTransition] = useTransition();
  const requestId = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    const id = ++requestId.current;
    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchAction(q);
        if (id === requestId.current) {
          setResults(data);
          setSearched(true);
        }
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  function go(r: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(`/docs/${r.courseSlug}/${r.lessonSlug}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border bg-surface px-3 text-sm text-muted hover:text-foreground"
        aria-label="جستجو"
      >
        <Search className="size-4" />
        <span className="flex-1 text-start">جستجو در درس‌ها...</span>
        <kbd dir="ltr" className="hidden rounded border bg-background px-1.5 font-mono text-[11px] sm:inline">
          Ctrl K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-24 -translate-y-0 p-0">
          <DialogTitle className="sr-only">جستجو</DialogTitle>
          <Command shouldFilter={false} label="جستجوی سراسری">
            <div className="flex items-center gap-2 border-b px-4">
              <Search className="size-4 text-muted" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="نام دوره، عنوان یا متن درس..."
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              {pending && <div className="px-3 py-6 text-center text-sm text-muted">در حال جستجو...</div>}
              {!pending && searched && results.length === 0 && (
                <Command.Empty className="px-3 py-6 text-center text-sm text-muted">نتیجه‌ای پیدا نشد.</Command.Empty>
              )}
              {!pending && !searched && (
                <div className="px-3 py-6 text-center text-sm text-muted">حداقل ۲ حرف تایپ کنید.</div>
              )}
              {!pending &&
                results.map((r) => (
                  <Command.Item
                    key={r.lessonId}
                    value={r.lessonId}
                    onSelect={() => go(r)}
                    className="flex cursor-pointer flex-col gap-1 rounded-md px-3 py-2 aria-selected:bg-surface"
                  >
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <BookOpen className="size-3" />
                      {r.courseTitle}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <FileText className="size-4 text-accent" />
                      {r.lessonTitle}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted">{r.preview}</span>
                  </Command.Item>
                ))}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
