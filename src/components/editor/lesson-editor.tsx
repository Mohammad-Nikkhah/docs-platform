"use client";

import { useCallback, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import {
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Megaphone,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Undo2,
} from "lucide-react";
import { Callout, type CalloutVariant } from "@/components/editor/callout";
import { CODE_LANGUAGES, lowlight } from "@/lib/code-languages";
import { cn } from "@/lib/utils";

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-border/50 hover:text-foreground disabled:opacity-40",
        active && "bg-border/60 text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />;
}

function Toolbar({ editor, onError }: { editor: Editor; onError: (message: string | null) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const setLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("آدرس لینک (برای حذف، خالی بگذارید):", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  async function upload(file: File) {
    onError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "آپلود ناموفق بود");
      editor.chain().focus().setImage({ src: json.url, alt: file.name.replace(/\.[^.]+$/, "") }).run();
    } catch (err) {
      onError(err instanceof Error ? err.message : "آپلود ناموفق بود");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const inCode = editor.isActive("codeBlock");
  const inTable = editor.isActive("table");
  const language = (editor.getAttributes("codeBlock").language as string | undefined) ?? "";
  const calloutVariant = editor.getAttributes("callout").variant as CalloutVariant | undefined;

  return (
    <div className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 border-b bg-surface px-2 py-1.5" role="toolbar" aria-label="ابزار ویرایش">
      <ToolButton label="بازگردانی" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo2 className="size-4" />
      </ToolButton>
      <ToolButton label="از نو" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo2 className="size-4" />
      </ToolButton>
      <Divider />
      <ToolButton label="عنوان ۱" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="size-4" />
      </ToolButton>
      <ToolButton label="عنوان ۲" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </ToolButton>
      <ToolButton label="عنوان ۳" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-4" />
      </ToolButton>
      <Divider />
      <ToolButton label="پررنگ" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton label="کج" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="size-4" />
      </ToolButton>
      <ToolButton label="خط‌خورده" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="size-4" />
      </ToolButton>
      <ToolButton label="کد درون‌خطی" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="size-4" />
      </ToolButton>
      <ToolButton label="لینک" active={editor.isActive("link")} onClick={setLink}>
        <Link2 className="size-4" />
      </ToolButton>
      <Divider />
      <ToolButton label="لیست نقطه‌ای" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="size-4" />
      </ToolButton>
      <ToolButton label="لیست شماره‌دار" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </ToolButton>
      <ToolButton label="نقل‌قول" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </ToolButton>
      <ToolButton label="خط افقی" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </ToolButton>
      <Divider />
      <ToolButton label="بلوک کد" active={inCode} onClick={() => editor.chain().focus().toggleCodeBlock({ language: "bash" }).run()}>
        <Code2 className="size-4" />
      </ToolButton>
      {inCode && (
        <select
          aria-label="زبان کد"
          value={language}
          onChange={(e) => editor.chain().focus().updateAttributes("codeBlock", { language: e.target.value }).run()}
          className="h-8 rounded-md border bg-background px-2 text-xs"
          dir="ltr"
        >
          {CODE_LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      )}
      <ToolButton label="Callout" active={editor.isActive("callout")} onClick={() => editor.chain().focus().toggleCallout(calloutVariant ?? "info").run()}>
        <Megaphone className="size-4" />
      </ToolButton>
      {editor.isActive("callout") && (
        <select
          aria-label="نوع Callout"
          value={calloutVariant ?? "info"}
          onChange={(e) => editor.chain().focus().updateAttributes("callout", { variant: e.target.value }).run()}
          className="h-8 rounded-md border bg-background px-2 text-xs"
        >
          <option value="info">اطلاعات</option>
          <option value="tip">نکته</option>
          <option value="warning">هشدار</option>
          <option value="danger">خطر</option>
        </select>
      )}
      <Divider />
      <ToolButton
        label="جدول"
        active={inTable}
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <Table2 className="size-4" />
      </ToolButton>
      {inTable && (
        <>
          <ToolButton label="افزودن ستون" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <span className="text-[11px] font-bold">+ستون</span>
          </ToolButton>
          <ToolButton label="افزودن ردیف" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <span className="text-[11px] font-bold">+ردیف</span>
          </ToolButton>
          <ToolButton label="حذف ستون" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <span className="text-[11px] font-bold">−ستون</span>
          </ToolButton>
          <ToolButton label="حذف ردیف" onClick={() => editor.chain().focus().deleteRow().run()}>
            <span className="text-[11px] font-bold">−ردیف</span>
          </ToolButton>
          <ToolButton label="حذف جدول" onClick={() => editor.chain().focus().deleteTable().run()}>
            <span className="text-[11px] font-bold">×جدول</span>
          </ToolButton>
        </>
      )}
      <ToolButton label="تصویر" disabled={uploading} onClick={() => fileInput.current?.click()}>
        <ImagePlus className="size-4" />
      </ToolButton>
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      {uploading && <span className="ms-2 text-xs text-muted">در حال آپلود...</span>}
    </div>
  );
}

export function LessonEditor({
  initialContent,
  onChange,
}: {
  initialContent: JSONContent;
  onChange: (content: JSONContent) => void;
}) {
  const [toolbarError, setToolbarError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false, // avoid SSR hydration mismatch
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3] } }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: "bash" }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ["http", "https", "mailto"] }),
      Image,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Callout,
      Placeholder.configure({ placeholder: "محتوای درس را اینجا بنویسید..." }),
    ],
    content: initialContent,
    editorProps: {
      attributes: { class: "doc-content focus:outline-none", dir: "rtl", "aria-label": "ویرایشگر محتوای درس" },
    },
    onUpdate: ({ editor: e }) => onChange(e.getJSON()),
  });

  if (!editor) {
    return <div className="h-[460px] animate-pulse rounded-lg border bg-surface" role="status" aria-label="در حال بارگذاری ویرایشگر" />;
  }

  return (
    <div className="rounded-lg border">
      <Toolbar editor={editor} onError={setToolbarError} />
      {toolbarError && (
        <p role="alert" className="border-b px-3 py-2 text-sm text-danger">
          {toolbarError}
        </p>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
