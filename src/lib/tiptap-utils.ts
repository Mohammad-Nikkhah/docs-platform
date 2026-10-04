import type { JSONContent } from "@tiptap/react";

export type Heading = { id: string; level: 1 | 2 | 3; text: string };

export function nodeText(node: JSONContent | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(nodeText).join(node.type === "doc" ? "\n" : "");
}

export function plainText(content: JSONContent): string {
  const parts: string[] = [];
  const walk = (n: JSONContent) => {
    if (n.type === "text") {
      parts.push(n.text ?? "");
      return;
    }
    n.content?.forEach(walk);
    if (["paragraph", "heading", "listItem", "codeBlock", "callout", "tableRow"].includes(n.type ?? "")) {
      parts.push(" ");
    }
  };
  walk(content);
  return parts.join("").replace(/\s+/g, " ").trim();
}

export function headingId(text: string, used: Map<string, number>): string {
  const base =
    text
      .normalize("NFKC")
      .toLowerCase()
      .trim()
      .replace(/[‌‏‎]/g, "")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "section";
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

/** Headings (h2/h3) with stable unique ids; same traversal order as the renderer. */
export function extractHeadings(content: JSONContent): Heading[] {
  const used = new Map<string, number>();
  const result: Heading[] = [];
  const walk = (node: JSONContent) => {
    if (node.type === "heading") {
      const level = Number(node.attrs?.level ?? 2) as 1 | 2 | 3;
      const text = nodeText(node).trim();
      if (text) result.push({ id: headingId(text, used), level, text });
      return;
    }
    node.content?.forEach(walk);
  };
  walk(content);
  return result.filter((h) => h.level >= 2);
}

export function snippetAround(text: string, query: string, radius = 70): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, radius * 2).trim();
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}
