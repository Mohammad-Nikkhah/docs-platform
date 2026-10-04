import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-3 py-20 text-center">
      <p className="font-mono text-4xl font-bold text-muted">404</p>
      <h1 className="text-xl font-bold">صفحه پیدا نشد</h1>
      <p className="text-sm text-muted">دوره یا درس موردنظر وجود ندارد یا هنوز منتشر نشده است.</p>
      <Button asChild>
        <Link href="/docs">مشاهده دوره‌ها</Link>
      </Button>
    </div>
  );
}
