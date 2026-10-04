import { Fragment, type ReactNode } from "react";
import type { JSONContent } from "@tiptap/react";
import { AlertTriangle, Info, Lightbulb, OctagonAlert } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { languageLabel, lowlight } from "@/lib/code-languages";
import { headingId, nodeText } from "@/lib/tiptap-utils";

/**
 * Renders Tiptap JSON to React on the server. No innerHTML is used,
 * so stored content can never inject markup or scripts.
 */

type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: { className?: string[] };
  children?: HastNode[];
};

function renderHast(nodes: HastNode[], keyPrefix = "h"): ReactNode {
  return nodes.map((n, i) => {
    const key = `${keyPrefix}-${i}`;
    if (n.type === "text") return <Fragment key={key}>{n.value}</Fragment>;
    if (n.type === "element") {
      const cls = n.properties?.className?.join(" ");
      return (
        <span key={key} className={cls}>
          {renderHast(n.children ?? [], key)}
        </span>
      );
    }
    return null;
  });
}

function highlight(code: string, language: string | null | undefined): ReactNode {
  if (!language || !lowlight.registered(language)) return code;
  try {
    return renderHast(lowlight.highlight(language, code).children as HastNode[]);
  } catch {
    return code;
  }
}

function safeHref(href: unknown): string | undefined {
  if (typeof href !== "string") return undefined;
  if (href.startsWith("/") || href.startsWith("#")) return href;
  try {
    const url = new URL(href);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? href : undefined;
  } catch {
    return undefined;
  }
}

function safeImageSrc(src: unknown): string | undefined {
  if (typeof src !== "string") return undefined;
  if (src.startsWith("/uploads/")) return src;
  try {
    return new URL(src).protocol === "https:" ? src : undefined;
  } catch {
    return undefined;
  }
}

const calloutIcons = { info: Info, tip: Lightbulb, warning: AlertTriangle, danger: OctagonAlert } as const;

type Ctx = { used: Map<string, number> };

function renderText(node: JSONContent, key: string): ReactNode {
  let out: ReactNode = node.text ?? "";
  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
        out = <strong key={key}>{out}</strong>;
        break;
      case "italic":
        out = <em key={key}>{out}</em>;
        break;
      case "strike":
        out = <s key={key}>{out}</s>;
        break;
      case "code":
        out = <code key={key}>{out}</code>;
        break;
      case "link": {
        const href = safeHref(mark.attrs?.href);
        out = href ? (
          <a key={key} href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {out}
          </a>
        ) : (
          out
        );
        break;
      }
    }
  }
  return out;
}

function renderChildren(node: JSONContent, ctx: Ctx, keyPrefix: string): ReactNode {
  return (node.content ?? []).map((child, i) => renderNode(child, ctx, `${keyPrefix}-${i}`));
}

function renderNode(node: JSONContent, ctx: Ctx, key: string): ReactNode {
  switch (node.type) {
    case "text":
      return <Fragment key={key}>{renderText(node, key)}</Fragment>;
    case "paragraph":
      return <p key={key}>{renderChildren(node, ctx, key)}</p>;
    case "hardBreak":
      return <br key={key} />;
    case "heading": {
      const level = Math.min(3, Math.max(1, Number(node.attrs?.level ?? 2)));
      const text = nodeText(node).trim();
      const id = text ? headingId(text, ctx.used) : undefined;
      const Tag = `h${level}` as "h1" | "h2" | "h3";
      return (
        <Tag key={key} id={id}>
          {renderChildren(node, ctx, key)}
        </Tag>
      );
    }
    case "bulletList":
      return <ul key={key}>{renderChildren(node, ctx, key)}</ul>;
    case "orderedList":
      return <ol key={key}>{renderChildren(node, ctx, key)}</ol>;
    case "listItem":
      return <li key={key}>{renderChildren(node, ctx, key)}</li>;
    case "blockquote":
      return <blockquote key={key}>{renderChildren(node, ctx, key)}</blockquote>;
    case "horizontalRule":
      return <hr key={key} />;
    case "codeBlock": {
      const language = (node.attrs?.language as string | null) ?? null;
      const code = nodeText(node);
      return (
        <figure key={key} className="code-block not-prose">
          <figcaption className="flex items-center justify-between border-b px-3 py-1.5" dir="ltr">
            <span className="font-mono text-xs text-muted">{languageLabel(language)}</span>
            <CopyButton text={code} />
          </figcaption>
          <pre tabIndex={0}>
            <code>{highlight(code, language)}</code>
          </pre>
        </figure>
      );
    }
    case "image": {
      const src = safeImageSrc(node.attrs?.src);
      if (!src) return null;
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={key} src={src} alt={String(node.attrs?.alt ?? "")} loading="lazy" />;
    }
    case "callout": {
      const variant = (node.attrs?.variant as keyof typeof calloutIcons) in calloutIcons ? (node.attrs?.variant as keyof typeof calloutIcons) : "info";
      const Icon = calloutIcons[variant];
      return (
        <aside key={key} className="callout" data-variant={variant}>
          <Icon className="mt-1.5 size-5 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">{renderChildren(node, ctx, key)}</div>
        </aside>
      );
    }
    case "table":
      return (
        <div key={key} className="overflow-x-auto">
          <table>
            <tbody>{renderChildren(node, ctx, key)}</tbody>
          </table>
        </div>
      );
    case "tableRow":
      return <tr key={key}>{renderChildren(node, ctx, key)}</tr>;
    case "tableHeader":
      return <th key={key}>{renderChildren(node, ctx, key)}</th>;
    case "tableCell":
      return <td key={key}>{renderChildren(node, ctx, key)}</td>;
    default:
      return null;
  }
}

export function LessonContent({ content }: { content: JSONContent }) {
  const ctx: Ctx = { used: new Map() };
  return <div className="doc-content">{renderChildren(content, ctx, "n")}</div>;
}
