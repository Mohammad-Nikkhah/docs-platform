"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Heading } from "@/lib/tiptap-utils";

function useActiveHeading(headings: Heading[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return active;
}

function TocList({ headings, active }: { headings: Heading[]; active: string | null }) {
  function scrollTo(e: React.MouseEvent, id: string) {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${encodeURIComponent(id)}`);
  }
  return (
    <ul className="space-y-1 border-s text-sm">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            onClick={(e) => scrollTo(e, h.id)}
            className={cn(
              "-ms-px block border-s-2 border-transparent py-1 text-muted hover:text-foreground",
              h.level === 3 ? "ps-6" : "ps-3",
              active === h.id && "border-accent font-medium text-accent",
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const active = useActiveHeading(headings);
  const [open, setOpen] = useState(false);
  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile / tablet: collapsible */}
      <div className="mb-6 rounded-lg border xl:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium"
        >
          در این صفحه
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="border-t px-4 py-3">
            <TocList headings={headings} active={active} />
          </div>
        )}
      </div>

      {/* Desktop: sticky column */}
      <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto xl:order-last xl:block" aria-label="در این صفحه">
        <p className="mb-3 text-sm font-semibold">در این صفحه</p>
        <TocList headings={headings} active={active} />
      </aside>
    </>
  );
}
