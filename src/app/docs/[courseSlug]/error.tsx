"use client";

import { Button } from "@/components/ui/button";

export default function ErrorState({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-md space-y-3 py-20 text-center">
      <h2 className="text-xl font-bold">مشکلی پیش آمد</h2>
      <p className="text-sm text-muted">بارگذاری صفحه ناموفق بود. دوباره تلاش کنید.</p>
      <Button onClick={reset}>تلاش دوباره</Button>
    </div>
  );
}
