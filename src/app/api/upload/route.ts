import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-guards";
import { MAX_UPLOAD_BYTES, isAllowedImageType, storage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });
  if (!isAllowedImageType(file.type)) return NextResponse.json({ error: "فقط تصویر PNG, JPG, WebP یا GIF مجاز است" }, { status: 415 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "حجم فایل بیش از ۵ مگابایت است" }, { status: 413 });

  const saved = await storage.save({
    data: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
    originalName: file.name,
  });
  return NextResponse.json({ url: saved.url });
}
