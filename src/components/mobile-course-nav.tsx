"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SidebarNav, type SidebarLesson } from "@/components/sidebar-nav";

export function MobileCourseNav({
  courseSlug,
  courseTitle,
  lessons,
  header,
}: {
  courseSlug: string;
  courseTitle: string;
  lessons: SidebarLesson[];
  header: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="فهرست درس‌ها">
          <Menu />
        </Button>
      </DialogTrigger>
      <DialogContent side="start" aria-describedby={undefined}>
        <DialogTitle className="sr-only">{courseTitle}</DialogTitle>
        <div className="space-y-4 p-4 pt-10">
          {header}
          <SidebarNav courseSlug={courseSlug} lessons={lessons} onNavigate={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
