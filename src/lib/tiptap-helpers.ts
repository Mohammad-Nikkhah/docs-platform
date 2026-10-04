import type { JSONContent } from "@tiptap/react";

/** Small builders for Tiptap JSON documents (used by seed and defaults). */

export const text = (value: string, marks?: JSONContent["marks"]): JSONContent => ({
  type: "text",
  text: value,
  ...(marks ? { marks } : {}),
});

export const p = (...children: (string | JSONContent)[]): JSONContent => ({
  type: "paragraph",
  content: children.map((c) => (typeof c === "string" ? text(c) : c)),
});

export const h = (level: 1 | 2 | 3, value: string): JSONContent => ({
  type: "heading",
  attrs: { level },
  content: [text(value)],
});

export const code = (language: string, value: string): JSONContent => ({
  type: "codeBlock",
  attrs: { language },
  content: [text(value)],
});

export const ul = (...items: string[]): JSONContent => ({
  type: "bulletList",
  content: items.map((i) => ({ type: "listItem", content: [p(i)] })),
});

export const ol = (...items: string[]): JSONContent => ({
  type: "orderedList",
  content: items.map((i) => ({ type: "listItem", content: [p(i)] })),
});

export const callout = (
  variant: "info" | "warning" | "tip" | "danger",
  value: string,
): JSONContent => ({
  type: "callout",
  attrs: { variant },
  content: [p(value)],
});

export const doc = (...content: JSONContent[]): JSONContent => ({ type: "doc", content });

export const emptyDoc = (): JSONContent => doc({ type: "paragraph" });
