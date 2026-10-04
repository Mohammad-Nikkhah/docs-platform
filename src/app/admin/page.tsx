import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth-guards";
import { getAdminStats } from "@/lib/queries";
import { toPersianDigits } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "مدیریت", robots: { index: false } };

export default async function AdminHome() {
  await requireAdmin(); // layouts are not re-run on every navigation: check in each page too
  const s = await getAdminStats();
  const cards = [
    { label: "تعداد دوره‌ها", value: s.courses },
    { label: "دوره‌های منتشرشده", value: s.publishedCourses },
    { label: "تعداد درس‌ها", value: s.lessons },
    { label: "درس‌های منتشرشده", value: s.publishedLessons },
    { label: "تعداد کاربران", value: s.users },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">پنل مدیریت</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-2 text-3xl font-bold">{toPersianDigits(c.value)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
