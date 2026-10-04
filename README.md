# پلتفرم مستندات و آموزش (Next.js + PostgreSQL)

پلتفرم فارسی/RTL برای دوره‌ها و درس‌ها، با ظاهر مستندات توسعه‌دهندگان.
فقط به **Node.js** و **PostgreSQL** نیاز دارد (بدون Vercel/Supabase/Neon/Firebase).

## استک
Next.js (App Router) · TypeScript strict · Tailwind · Radix/shadcn-style UI · Lucide · PostgreSQL · Drizzle ORM · Auth.js (Google) · Tiptap · Zod · React Hook Form · next-themes

## راه‌اندازی محلی

```bash
cp .env.example .env        # DATABASE_URL, AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET را پر کنید
npm install
npm run db:generate         # ساخت migration از src/db/schema.ts (پوشه drizzle/)
npm run db:migrate
npm run db:seed             # دوره «مسیر SRE و DevOps» با ۱۰ درس
npm run dev
```

- `AUTH_SECRET`: با `openssl rand -base64 32` بسازید.
- Redirect URI در Google Console: `http://localhost:3000/api/auth/callback/google`
- پشت Nginx روی VPS، `AUTH_URL=https://your-domain` را هم تنظیم کنید (`trustHost` فعال است).
- `UPLOAD_DIR` (اختیاری، پیش‌فرض `./uploads`): محل ذخیره تصاویر آپلودی.

## ساخت اولین ادمین
نقش پیش‌فرض `USER` است. بعد از اولین ورود با Google:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

## ساختار

```
src/
  app/        مسیرها (site)، docs، admin، dashboard، api
  actions/    Server Actions (courses, lessons, progress/search)
  components/ UI، ادیتور Tiptap، سایدبار، TOC، جستجو
  db/         schema، اتصال، migrate، seed
  lib/        queries، validation (Zod)، auth-guards، storage، tiptap utils
```

## تصمیم‌های معماری
- **Authorization سمت سرور:** Auth.js با session دیتابیسی؛ `role` همیشه از PostgreSQL خوانده می‌شود. هر صفحه `/admin/*` و هر Server Action از `requireAdmin()/assertAdmin()` استفاده می‌کند. کاربر عادی به `/forbidden` (۴۰۳) می‌رود.
- **محتوا:** JSON خام Tiptap در ستون `jsonb`؛ رندر با React (بدون `innerHTML`).
- **جستجو:** `ILIKE` روی عنوان/توضیح/متن درس. برای حجم خیلی بزرگ می‌توان بعداً `pg_trgm` یا full-text اضافه کرد.
- **آپلود:** اینترفیس `StorageProvider` در `src/lib/storage.ts`؛ فعلاً دیسک محلی. برای S3/MinIO فقط یک پیاده‌سازی جدید لازم است.
- `output: "standalone"` فعال است تا بعداً Deploy روی VPS ساده باشد.

## وضعیت بررسی
این کد در محیطی نوشته شد که دسترسی به npm registry بسته بود؛ پس **`npm install`، `build`، `lint` و تست واقعی با PostgreSQL اجرا نشده**. فقط نبود خطای سینتکسی با `tsc` بررسی شد. بعد از `npm install` احتمالاً چند خطای تایپ/نسخه باید رفع شود.
