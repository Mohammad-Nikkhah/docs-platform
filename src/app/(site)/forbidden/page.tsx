import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "403 - دسترسی ممنوع", robots: { index: false } };

export default function ForbiddenPage() {
  return (
    <main className="mx-auto max-w-md space-y-3 px-4 py-24 text-center">
      <p className="font-mono text-4xl font-bold text-muted">403</p>
      <h1 className="text-xl font-bold">دسترسی ممنوع</h1>
      <p className="text-sm text-muted">برای دیدن این صفحه به دسترسی مدیر نیاز دارید.</p>
      <Button asChild>
        <Link href="/">بازگشت به خانه</Link>
      </Button>
    </main>
  );
}
