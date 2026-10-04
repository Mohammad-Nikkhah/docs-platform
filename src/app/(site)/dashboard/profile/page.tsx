import type { Metadata } from "next";
import Image from "next/image";
import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth-guards";

export const metadata: Metadata = { title: "پروفایل", robots: { index: false } };

export default async function ProfilePage() {
  const user = await requireUser("/dashboard/profile");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">پروفایل</h1>
      <Card className="flex items-center gap-5 p-6">
        {user.image ? (
          <Image src={user.image} alt="" width={72} height={72} className="rounded-full" />
        ) : (
          <span className="flex size-[72px] items-center justify-center rounded-full border bg-background text-muted">
            <User className="size-8" aria-hidden />
          </span>
        )}
        <dl className="space-y-1">
          <div>
            <dt className="text-xs text-muted">نام</dt>
            <dd className="font-semibold">{user.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">ایمیل</dt>
            <dd dir="ltr" className="text-start">
              {user.email}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
