"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-md space-y-3 py-20 text-center">
      <h2 className="text-xl font-bold">خطا در پنل مدیریت</h2>
      <p className="text-sm text-muted">عملیات ناموفق بود. دوباره تلاش کنید.</p>
      <Button onClick={reset}>تلاش دوباره</Button>
    </div>
  );
}
