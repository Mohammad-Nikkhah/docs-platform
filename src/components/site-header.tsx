import Link from "next/link";
import Image from "next/image";
import { BookOpen, LayoutDashboard, LogIn, LogOut, Shield } from "lucide-react";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/auth-guards";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SearchPalette } from "@/components/search-palette";

export async function SiteHeader({ mobileNav }: { mobileNav?: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 md:h-14 md:flex-nowrap md:py-0">
        {mobileNav}
        <Link href="/" className="flex items-center gap-2 font-bold">
          <BookOpen className="size-5 text-accent" />
          <span className="hidden sm:inline">مستندات آموزشی</span>
        </Link>

        {/* single palette instance: second row on mobile, centered on desktop */}
        <div className="order-last flex w-full justify-center md:order-none md:mx-2 md:w-auto md:flex-1">
          <SearchPalette />
        </div>
        <div className="flex-1 md:hidden" />

        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/docs">دوره‌ها</Link>
          </Button>
          <ThemeSwitcher />
          {user ? (
            <div className="flex items-center gap-1">
              {user.role === "ADMIN" && (
                <Button asChild variant="ghost" size="icon" title="مدیریت">
                  <Link href="/admin" aria-label="مدیریت">
                    <Shield />
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="icon" title="داشبورد">
                <Link href="/dashboard" aria-label="داشبورد">
                  {user.image ? (
                    <Image src={user.image} alt="" width={28} height={28} className="rounded-full" />
                  ) : (
                    <LayoutDashboard />
                  )}
                </Link>
              </Button>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost" size="icon" title="خروج" aria-label="خروج">
                  <LogOut />
                </Button>
              </form>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">
                <LogIn />
                ورود
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
