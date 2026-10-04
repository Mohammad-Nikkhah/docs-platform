import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import type { JSONContent } from "@tiptap/react";
import { courses, lessons } from "./schema";
import { callout, code, doc, h, ol, p, ul } from "../lib/tiptap-helpers";

type SeedLesson = { title: string; slug: string; description: string; content: JSONContent };

const seedLessons: SeedLesson[] = [
  {
    title: "مقدمه SRE",
    slug: "sre-introduction",
    description: "SRE چیست و چرا به وجود آمد؟",
    content: doc(
      h(2, "مقدمه"),
      p("Site Reliability Engineering یا SRE رویکردی است که مهندسی نرم‌افزار را برای حل مسائل عملیاتی به کار می‌گیرد."),
      h(2, "SRE چه تفاوتی با Ops دارد؟"),
      ul(
        "خودکارسازی کارهای تکراری به جای انجام دستی",
        "تصمیم‌گیری بر پایه داده و SLO",
        "پذیرش ریسک کنترل‌شده با Error Budget",
      ),
      callout("tip", "هدف SRE صفر کردن خطا نیست؛ هدف رسیدن به سطح قابل‌قبولی از پایداری است."),
      h(2, "جمع‌بندی"),
      p("در درس‌های بعد ابزارها و مفاهیم پایه را قدم به قدم یاد می‌گیریم."),
    ),
  },
  {
    title: "Linux Fundamentals",
    slug: "linux-fundamentals",
    description: "مفاهیم پایه لینوکس: فایل‌سیستم، دسترسی‌ها و دستورات اصلی.",
    content: doc(
      h(2, "Linux چیست؟"),
      p("Linux هسته‌ای متن‌باز است که اساس بیشتر سرورهای دنیا را تشکیل می‌دهد."),
      h(2, "Filesystem"),
      p("همه‌چیز در لینوکس زیر مسیر ریشه (/) قرار می‌گیرد. چند مسیر مهم:"),
      ul("/etc برای فایل‌های پیکربندی", "/var/log برای لاگ‌ها", "/home پوشه کاربران"),
      code("bash", "ls -la /etc\ncd /var/log\ntail -n 50 syslog"),
      h(2, "Permissions"),
      p("هر فایل سه سطح دسترسی دارد: مالک، گروه و بقیه."),
      code("bash", "chmod 640 secret.txt\nchown root:admin secret.txt"),
      callout("warning", "هرگز دسترسی 777 را روی فایل‌های سرور تنظیم نکنید."),
      h(2, "جمع‌بندی"),
      p("با این دستورات می‌توانید در سرور گشت‌وگذار کنید و دسترسی‌ها را مدیریت کنید."),
    ),
  },
  {
    title: "Networking Fundamentals",
    slug: "networking-fundamentals",
    description: "IP، DNS، پورت‌ها و مسیر یک درخواست HTTP.",
    content: doc(
      h(2, "مقدمه"),
      p("هر سرویس تحت شبکه با آدرس IP و یک پورت مشخص می‌شود."),
      h(2, "DNS"),
      p("DNS نام دامنه را به آدرس IP تبدیل می‌کند."),
      code("bash", "dig example.com +short\nping -c 3 example.com"),
      h(2, "پورت‌های رایج"),
      ul("22: SSH", "80: HTTP", "443: HTTPS", "5432: PostgreSQL"),
      h(2, "جمع‌بندی"),
      p("برای عیب‌یابی شبکه ابتدا DNS، سپس اتصال و در نهایت پورت را بررسی کنید."),
    ),
  },
  {
    title: "Processes",
    slug: "processes",
    description: "مدیریت پروسس‌ها، سیگنال‌ها و مانیتورینگ منابع.",
    content: doc(
      h(2, "پروسس چیست؟"),
      p("پروسس یک برنامه در حال اجراست که PID یکتا دارد."),
      code("bash", "ps aux | grep nginx\ntop\nkill -15 1234"),
      h(2, "سیگنال‌ها"),
      ul("SIGTERM (15): درخواست توقف مرتب", "SIGKILL (9): توقف اجباری"),
      callout("info", "ابتدا SIGTERM بفرستید تا برنامه فرصت بستن اتصال‌ها را داشته باشد."),
      h(2, "جمع‌بندی"),
      p("شناخت پروسس‌ها پایه عیب‌یابی در سرور است."),
    ),
  },
  {
    title: "Services",
    slug: "services",
    description: "مدیریت سرویس‌ها با systemd.",
    content: doc(
      h(2, "systemd"),
      p("در اغلب توزیع‌های مدرن، سرویس‌ها با systemd مدیریت می‌شوند."),
      code("bash", "sudo systemctl status nginx\nsudo systemctl restart nginx\nsudo systemctl enable nginx"),
      h(2, "نمونه Unit"),
      code(
        "yaml",
        "[Service]\nExecStart=/usr/bin/node server.js\nRestart=on-failure",
      ),
      h(2, "جمع‌بندی"),
      p("با systemctl وضعیت و چرخه عمر سرویس‌ها را کنترل می‌کنیم."),
    ),
  },
  {
    title: "Monitoring",
    slug: "monitoring",
    description: "متریک‌ها، هشدارها و چهار سیگنال طلایی.",
    content: doc(
      h(2, "چرا مانیتورینگ؟"),
      p("بدون مانیتورینگ، از مشکل‌ها وقتی باخبر می‌شویم که کاربر شکایت کند."),
      h(2, "چهار سیگنال طلایی"),
      ol("Latency (تاخیر)", "Traffic (ترافیک)", "Errors (خطاها)", "Saturation (اشباع منابع)"),
      callout("tip", "هشدارها باید قابل اقدام باشند؛ هشدار بی‌اثر باعث بی‌توجهی می‌شود."),
      h(2, "جمع‌بندی"),
      p("متریک‌های درست پایه SLO و تصمیم‌های مهندسی هستند."),
    ),
  },
  {
    title: "Logging",
    slug: "logging",
    description: "لاگ ساختارمند و بررسی لاگ‌ها.",
    content: doc(
      h(2, "لاگ ساختارمند"),
      p("لاگ‌ها را به صورت JSON ثبت کنید تا قابل جستجو و تحلیل باشند."),
      code("json", '{ "level": "error", "msg": "db timeout", "service": "api" }'),
      h(2, "بررسی لاگ سرویس"),
      code("bash", "journalctl -u nginx --since '1 hour ago'"),
      h(2, "جمع‌بندی"),
      p("لاگ خوب زمان عیب‌یابی را به شکل چشمگیری کم می‌کند."),
    ),
  },
  {
    title: "Incident Management",
    slug: "incident-management",
    description: "مدیریت رخداد و Postmortem بدون سرزنش.",
    content: doc(
      h(2, "چرخه یک رخداد"),
      ol("تشخیص", "اعلام و تعیین مسئول", "کاهش اثر", "رفع ریشه‌ای", "Postmortem"),
      callout("info", "Postmortem بدون سرزنش یعنی تمرکز روی سیستم و فرایند، نه افراد."),
      h(2, "جمع‌بندی"),
      p("هر رخداد فرصتی برای بهتر شدن سیستم است."),
    ),
  },
  {
    title: "SLO و SLA",
    slug: "slo-and-sla",
    description: "تفاوت SLI، SLO و SLA.",
    content: doc(
      h(2, "تعریف‌ها"),
      ul(
        "SLI: شاخص اندازه‌گیری‌شده، مثل درصد درخواست‌های موفق",
        "SLO: هدف داخلی برای SLI، مثل ۹۹.۹٪",
        "SLA: تعهد قراردادی به مشتری",
      ),
      callout("tip", "SLO را سخت‌گیرانه‌تر از SLA تعیین کنید تا حاشیه اطمینان داشته باشید."),
      h(2, "جمع‌بندی"),
      p("SLO زبان مشترک بین تیم محصول و مهندسی است."),
    ),
  },
  {
    title: "Error Budget",
    slug: "error-budget",
    description: "بودجه خطا و تصمیم‌گیری برای انتشار.",
    content: doc(
      h(2, "Error Budget چیست؟"),
      p("اگر SLO برابر ۹۹.۹٪ باشد، ۰.۱٪ زمان به عنوان بودجه خطا قابل مصرف است."),
      code("python", "budget_minutes = 30 * 24 * 60 * (1 - 0.999)\nprint(round(budget_minutes, 1))  # 43.2"),
      h(2, "استفاده از بودجه"),
      ul("بودجه باقی‌مانده: انتشار سریع‌تر", "بودجه تمام‌شده: تمرکز روی پایداری"),
      h(2, "جمع‌بندی"),
      p("Error Budget تعادل میان سرعت نوآوری و پایداری را عینی می‌کند."),
    ),
  },
];

async function main() {
  const defaultDatabaseUrl = "postgresql://postgres:19909019@localhost:5432/docs_platform";
  const url = process.env.DATABASE_URL ?? defaultDatabaseUrl;
  if (!url) throw new Error("DATABASE_URL is not set. Create a .env file using .env.example and point it to your PostgreSQL instance.");
  const pool = new Pool({ connectionString: url, max: 1 });
  const db = drizzle(pool);

  const slug = "sre-devops-path";
  const existing = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  let courseId = existing[0]?.id;

  if (!courseId) {
    const [created] = await db
      .insert(courses)
      .values({
        title: "مسیر SRE و DevOps",
        slug,
        description: "از مبانی لینوکس و شبکه تا SLO و مدیریت رخداد، قدم به قدم.",
        icon: "Server",
        published: true,
      })
      .returning({ id: courses.id });
    courseId = created?.id;
  }
  if (!courseId) throw new Error("Failed to create seed course");

  for (const [index, lesson] of seedLessons.entries()) {
    await db
      .insert(lessons)
      .values({ ...lesson, courseId, order: index + 1, published: true })
      .onConflictDoNothing({ target: [lessons.courseId, lessons.slug] });
  }

  await pool.end();
  console.log(`Seeded course "${slug}" with ${seedLessons.length} lessons.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
