"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "روشن", Icon: Sun },
  { value: "dark", label: "تاریک", Icon: Moon },
  { value: "system", label: "سیستم", Icon: Monitor },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div role="radiogroup" aria-label="تم" className="inline-flex rounded-md border p-0.5">
      {options.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn("rounded p-1.5 text-muted hover:text-foreground", active && "bg-surface text-foreground")}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
