"use client";

import { useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import EmojiPicker from "./EmojiPicker";

export type EditorMode = "normal" | "fullscreen" | "zen";

function Btn({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
  wide = false,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-8 ${wide ? "px-2" : "min-w-8 px-1.5"} rounded text-sm font-semibold inline-flex items-center justify-center transition-colors disabled:opacity-40 ${
        active ? "bg-kn-red text-white" : "text-neutral-700 hover:bg-kn-gray"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-kn-border self-center" aria-hidden />;
}

export default function Toolbar({
  editor,
  uploading,
  mode,
  onSetMode,
  onLink,
  onUploadImage,
  onImageUrl,
  onYoutube,
  onSocialEmbed,
  onToggleFind,
}: {
  editor: Editor;
  uploading: boolean;
  mode: EditorMode;
  onSetMode: (m: EditorMode) => void;
  onLink: () => void;
  onUploadImage: () => void;
  onImageUrl: () => void;
  onYoutube: () => void;
  onSocialEmbed: () => void;
  onToggleFind: () => void;
}) {
  const [emojiOpen, setEmojiOpen] = useState(false);

  const s = useEditorState({
    editor,
    selector: ({ editor }: { editor: Editor | null }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            strike: editor.isActive("strike"),
            heading: [2, 3, 4, 5, 6].find((l) => editor.isActive("heading", { level: l })) ?? 0,
            blockquote: editor.isActive("blockquote"),
            callout: editor.isActive("callout"),
            codeBlock: editor.isActive("codeBlock"),
            bulletList: editor.isActive("bulletList"),
            orderedList: editor.isActive("orderedList"),
            link: editor.isActive("link"),
            table: editor.isActive("table"),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
          }
        : null,
  });

  return (
    <div className="relative border-b border-kn-border bg-neutral-50 rounded-t-md">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <Btn title="Undo (Ctrl+Z)" disabled={!s?.canUndo} onClick={() => editor.chain().focus().undo().run()}>↺</Btn>
        <Btn title="Redo (Ctrl+Y)" disabled={!s?.canRedo} onClick={() => editor.chain().focus().redo().run()}>↻</Btn>
        <Divider />
        <select
          title="Paragraph / Heading"
          value={s?.heading ?? 0}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            const level = Number(e.target.value);
            if (level === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().setHeading({ level: level as 2 | 3 | 4 | 5 | 6 }).run();
          }}
          className="h-8 rounded border border-kn-border bg-white px-1 text-xs font-semibold outline-none"
        >
          <option value={0}>पैराग्राफ</option>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
          <option value={4}>Heading 4</option>
          <option value={5}>Heading 5</option>
          <option value={6}>Heading 6</option>
        </select>
        <Divider />
        <Btn title="Bold (Ctrl+B)" active={s?.bold} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></Btn>
        <Btn title="Italic (Ctrl+I)" active={s?.italic} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></Btn>
        <Btn title="Underline (Ctrl+U)" active={s?.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}><span className="underline">U</span></Btn>
        <Btn title="Strikethrough" active={s?.strike} onClick={() => editor.chain().focus().toggleStrike().run()}><span className="line-through">S</span></Btn>
        <Divider />
        <Btn title="Bullet List" active={s?.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>≔</Btn>
        <Btn title="Numbered List" active={s?.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</Btn>
        <Btn title="Quote / उद्धरण" active={s?.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;&rdquo;</Btn>
        <Btn title="Callout बॉक्स" active={s?.callout} onClick={() => editor.chain().focus().toggleCallout().run()}>▣</Btn>
        <Btn title="Code Block" active={s?.codeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{"</>"}</Btn>
        <Btn title="Divider Line" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</Btn>
        <Divider />
        <Btn title="Link (Ctrl+K)" active={s?.link} onClick={onLink}>🔗</Btn>
        <Btn title="इमेज अपलोड (या drag-drop करें)" disabled={uploading} onClick={onUploadImage}>{uploading ? "…" : "🖼️"}</Btn>
        <Btn title="इमेज URL से" onClick={onImageUrl}>🌐</Btn>
        <Btn title="YouTube वीडियो" onClick={onYoutube}>▶</Btn>
        <Btn title="X / Instagram / Facebook एम्बेड (URL पेस्ट भी कर सकते हैं)" onClick={onSocialEmbed}>@</Btn>
        <Btn
          title="Table (3×3)"
          active={s?.table}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          ⊞
        </Btn>
        <div className="relative">
          <Btn title="Emoji" onClick={() => setEmojiOpen((o) => !o)}>🙂</Btn>
          {emojiOpen && (
            <EmojiPicker
              onSelect={(e) => editor.chain().focus().insertContent(e).run()}
              onClose={() => setEmojiOpen(false)}
            />
          )}
        </div>
        <Divider />
        <Btn title="Find & Replace (Ctrl+F)" onClick={onToggleFind}>🔍</Btn>
        <span className="flex-1" />
        <Btn
          title={mode === "fullscreen" ? "Fullscreen बंद करें" : "Fullscreen"}
          active={mode === "fullscreen"}
          onClick={() => onSetMode(mode === "fullscreen" ? "normal" : "fullscreen")}
        >
          ⛶
        </Btn>
        <Btn
          title={mode === "zen" ? "Focus mode बंद करें" : "Focus mode (distraction-free)"}
          active={mode === "zen"}
          onClick={() => onSetMode(mode === "zen" ? "normal" : "zen")}
        >
          ☯
        </Btn>
      </div>

      {/* Table controls appear only inside a table */}
      {s?.table && (
        <div className="flex flex-wrap items-center gap-0.5 border-t border-kn-border px-2 py-1 bg-white">
          <Btn wide title="Row ऊपर जोड़ें" onClick={() => editor.chain().focus().addRowBefore().run()}>+Row↑</Btn>
          <Btn wide title="Row नीचे जोड़ें" onClick={() => editor.chain().focus().addRowAfter().run()}>+Row↓</Btn>
          <Btn wide title="Row हटाएँ" onClick={() => editor.chain().focus().deleteRow().run()}>−Row</Btn>
          <Divider />
          <Btn wide title="Column बाएँ जोड़ें" onClick={() => editor.chain().focus().addColumnBefore().run()}>+Col←</Btn>
          <Btn wide title="Column दाएँ जोड़ें" onClick={() => editor.chain().focus().addColumnAfter().run()}>+Col→</Btn>
          <Btn wide title="Column हटाएँ" onClick={() => editor.chain().focus().deleteColumn().run()}>−Col</Btn>
          <Divider />
          <Btn wide title="Header row toggle" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Header</Btn>
          <Btn wide title="पूरी table हटाएँ" onClick={() => editor.chain().focus().deleteTable().run()}>🗑 Table</Btn>
        </div>
      )}
    </div>
  );
}
