import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { getCurrentUser } from "@/lib/auth-guards";
import { loginRedirectSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "ورود", robots: { index: false } };

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
  const { callbackUrl, error } = await searchParams;
  const parsed = loginRedirectSchema.safeParse(callbackUrl);
  const redirectTo = parsed.success ? parsed.data : "/dashboard";

  if (await getCurrentUser()) redirect(redirectTo);

  return (
    <main className="mx-auto flex max-w-sm flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">ورود به حساب</h1>
      <p className="mt-2 text-sm text-muted">برای ثبت پیشرفت و دسترسی به داشبورد وارد شوید.</p>

      {error && (
        <p role="alert" className="mt-4 w-full rounded-md border border-danger/40 px-3 py-2 text-sm text-danger">
          ورود ناموفق بود. دوباره تلاش کنید.
        </p>
      )}

      <form
        className="mt-8 w-full"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo });
        }}
      >
        <Button type="submit" variant="outline" size="lg" className="w-full">
          <GoogleLogo />
          ادامه با Google
        </Button>
      </form>
    </main>
  );
}
