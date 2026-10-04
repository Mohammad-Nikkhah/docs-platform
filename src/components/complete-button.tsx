"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setLessonCompletedAction } from "@/actions/progress";

export function CompleteButton({
  lessonId,
  initialCompleted,
  signedIn,
  callbackPath,
}: {
  lessonId: string;
  initialCompleted: boolean;
  signedIn: boolean;
  callbackPath: string;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <Button asChild variant="outline">
        <Link href={`/login?callbackUrl=${encodeURIComponent(callbackPath)}`}>برای ثبت پیشرفت وارد شوید</Link>
      </Button>
    );
  }

  function toggle() {
    const next = !completed;
    setCompleted(next); // optimistic
    setError(null);
    startTransition(async () => {
      const res = await setLessonCompletedAction({ lessonId, completed: next });
      if (!res.ok) {
        setCompleted(!next);
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={toggle}
        disabled={pending}
        variant={completed ? "success" : "outline"}
        size="lg"
        aria-pressed={completed}
      >
        {completed ? <CheckCircle2 /> : <Check />}
        {completed ? "این درس را کامل کردی" : "✓ این درس را کامل کردم"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
