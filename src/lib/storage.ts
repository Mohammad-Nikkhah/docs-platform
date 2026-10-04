import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Storage abstraction. The app only talks to `StorageProvider`, so swapping
 * local disk for S3/MinIO later means adding one class and changing `storage`.
 */
export interface StorageProvider {
  save(file: { data: Buffer; contentType: string; originalName: string }): Promise<{ key: string; url: string }>;
  read(key: string): Promise<{ data: Buffer; contentType: string } | null>;
}

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
const EXT_TO_TYPE = Object.fromEntries(Object.entries(ALLOWED).map(([t, e]) => [e, t]));

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const isAllowedImageType = (type: string) => type in ALLOWED;

class LocalDiskStorage implements StorageProvider {
  private readonly root = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

  async save({ data, contentType }: { data: Buffer; contentType: string; originalName: string }) {
    const ext = ALLOWED[contentType];
    if (!ext) throw new Error("Unsupported file type");
    await mkdir(this.root, { recursive: true });
    const key = `${randomUUID()}.${ext}`;
    await writeFile(path.join(this.root, key), data);
    return { key, url: `/uploads/${key}` };
  }

  async read(key: string) {
    // keys are server-generated: strict pattern prevents path traversal
    if (!/^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/.test(key)) return null;
    const ext = key.split(".").pop() ?? "";
    try {
      const data = await readFile(path.join(this.root, key));
      return { data, contentType: EXT_TO_TYPE[ext] ?? "application/octet-stream" };
    } catch {
      return null;
    }
  }
}

export const storage: StorageProvider = new LocalDiskStorage();
