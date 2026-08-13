"use client";

// Professional WYSIWYG editor for article bodies (TipTap).
// Outputs HTML into a hidden form field so the existing saveArticle server
// action keeps working unchanged. Modular pieces live in this folder.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useEditor,
  useEditorState,
  EditorContent,
  type Editor,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Youtube from "@tiptap/extension-youtube";
import { TableKit } from "@tiptap/extension-table";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { marked } from "marked";
import { normalizeArticleHtml } from "@/lib/utils";
import { FigureImage, type FigureAlign } from "./FigureImage";
import { SocialEmbed, detectPlatform } from "./SocialEmbed";
import { Callout } from "./Callout";
import Toolbar, { type EditorMode } from "./Toolbar";
import FindReplace from "./FindReplace";
import { uploadImageFile, isImageFile } from "./upload";

const READ_WPM = 200;

function looksLikeMarkdown(text: string): boolean {
  if (/^#{1,6}\s.+/m.test(text)) return true;
  if (/\*\*[^*\n]+\*\*/.test(text)) return true;
  if (/^\s*(?:[-*]|\d+\.)\s+.+(?:\n\s*(?:[-*]|\d+\.)\s+.+)+/m.test(text)) return true;
  if (/^>\s.+/m.test(text)) return true;
  if (/\[[^\]]+\]\([^)]+\)/.test(text)) return true;
  return false;
}

export default function RichTextEditor({
  name,
  defaultValue = "",
  placeholder = "यहाँ खबर लिखें… (Google Docs/Word से paste करने पर फ़ॉर्मेटिंग बनी रहती है)",
  onChangeHtml,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  onChangeHtml?: (html: string) => void;
}) {
  const [html, setHtml] = useState(() => normalizeArticleHtml(defaultValue));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mode, setMode] = useState<EditorMode>("normal");
  const [findOpen, setFindOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);

  const insertUploadedImages = useCallback(async (files: File[], pos?: number) => {
    const ed = editorRef.current;
    if (!ed) return;
    setUploading(true);
    setUploadError(null);
    for (const file of files) {
      if (!isImageFile(file)) continue;
      const res = await uploadImageFile(file);
      if (res.ok) {
        const chain = ed.chain().focus();
        if (pos !== undefined) {
          chain.insertContentAt(pos, { type: "figureImage", attrs: { src: res.url, alt: "" } }).run();
        } else {
          chain.setFigureImage({ src: res.url }).run();
        }
      } else {
        setUploadError(res.message);
      }
    }
    setUploading(false);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4, 5, 6] },
        link: { openOnClick: false, defaultProtocol: "https" },
      }),
      FigureImage,
      SocialEmbed,
      Callout,
      TableKit.configure({ table: { resizable: false } }),
      Youtube.configure({ nocookie: true }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: normalizeArticleHtml(defaultValue),
    editorProps: {
      attributes: {
        class: "article-body rte-content px-4 py-3",
      },
      handlePaste: (view, event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;
        // 1) pasted image files (e.g. screenshots)
        const files = Array.from(clipboard.files || []).filter(isImageFile);
        if (files.length) {
          event.preventDefault();
          void insertUploadedImages(files);
          return true;
        }
        // 2) plain-text markdown → rich content
        const htmlData = clipboard.getData("text/html");
        const text = clipboard.getData("text/plain");
        if (!htmlData && text && looksLikeMarkdown(text)) {
          event.preventDefault();
          const parsed = marked.parse(text, { breaks: true, async: false }) as string;
          editorRef.current?.chain().focus().insertContent(parsed).run();
          return true;
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || []).filter(isImageFile);
        if (!files.length) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        void insertUploadedImages(files, coords?.pos);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const value = editor.isEmpty ? "" : editor.getHTML();
      setHtml(value);
      onChangeHtml?.(value);
    },
  });
  editorRef.current = editor;

  const counts = useEditorState({
    editor,
    selector: ({ editor }: { editor: Editor | null }) =>
      editor
        ? {
            words: editor.storage.characterCount.words(),
            chars: editor.storage.characterCount.characters(),
          }
        : null,
  });

  const imageState = useEditorState({
    editor,
    selector: ({ editor }: { editor: Editor | null }) =>
      editor && editor.isActive("figureImage")
        ? {
            alt: (editor.getAttributes("figureImage").alt as string) || "",
            align: (editor.getAttributes("figureImage").align as FigureAlign) || "center",
            width: (editor.getAttributes("figureImage").width as number | null) ?? null,
          }
        : null,
  });

  // Esc exits fullscreen/zen
  useEffect(() => {
    if (mode === "normal") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode("normal");
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mode]);

  const openLinkPanel = useCallback(() => {
    const prev = editorRef.current?.getAttributes("link").href as string | undefined;
    setLinkUrl(prev || "");
    setLinkOpen(true);
  }, []);

  const applyLink = () => {
    const ed = editorRef.current;
    if (!ed) return;
    const url = linkUrl.trim();
    if (!url) {
      ed.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const href = /^(https?:\/\/|mailto:|\/)/i.test(url) ? url : `https://${url}`;
      if (ed.state.selection.empty && !ed.isActive("link")) {
        ed.chain().focus().insertContent(`<a href="${href}">${href}</a>`).run();
      } else {
        ed.chain().focus().extendMarkRange("link").setLink({ href }).run();
      }
    }
    setLinkOpen(false);
  };

  const addYoutube = () => {
    const url = window.prompt("YouTube वीडियो का URL:");
    if (!url?.trim()) return;
    editorRef.current?.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  };

  const addSocialEmbed = () => {
    const url = window.prompt("X (Twitter), Instagram या Facebook पोस्ट का URL:");
    if (!url?.trim()) return;
    const platform = detectPlatform(url.trim());
    if (!platform) {
      window.alert("यह URL समर्थित नहीं है। X/Twitter status, Instagram post/reel या Facebook post का पूरा URL डालें।");
      return;
    }
    editorRef.current?.chain().focus().setSocialEmbed({ platform, url: url.trim() }).run();
  };

  const addImageByUrl = () => {
    const url = window.prompt("इमेज URL (/uploads/… या https://…):");
    if (!url?.trim()) return;
    editorRef.current?.chain().focus().setFigureImage({ src: url.trim() }).run();
  };

  if (!editor) {
    return (
      <div className="rounded-md border border-kn-border bg-white">
        <div className="h-10 border-b border-kn-border bg-kn-gray/40" />
        <div className="min-h-[320px] px-4 py-3 text-sm text-kn-muted">एडिटर लोड हो रहा है…</div>
      </div>
    );
  }

  const words = counts?.words ?? 0;
  const readMins = Math.max(1, Math.ceil(words / READ_WPM));

  const wrapperCls =
    mode === "normal"
      ? "rounded-md border border-kn-border bg-white focus-within:border-kn-red"
      : "fixed inset-0 z-[100] bg-white flex flex-col";

  return (
    <div
      className={wrapperCls}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          openLinkPanel();
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
          e.preventDefault();
          setFindOpen(true);
        }
      }}
    >
      <input type="hidden" name={name} value={html} />

      {mode === "zen" ? (
        <div className="flex items-center justify-between border-b border-kn-border px-4 py-2 bg-neutral-50">
          <span className="text-xs font-semibold text-kn-muted">
            Focus mode — {words} शब्द · Esc से बाहर निकलें
          </span>
          <button
            type="button"
            onClick={() => setMode("normal")}
            className="text-sm font-bold text-kn-muted hover:text-kn-dark"
          >
            ✕ बंद करें
          </button>
        </div>
      ) : (
        <Toolbar
          editor={editor}
          uploading={uploading}
          mode={mode}
          onSetMode={setMode}
          onLink={openLinkPanel}
          onUploadImage={() => fileRef.current?.click()}
          onImageUrl={addImageByUrl}
          onYoutube={addYoutube}
          onSocialEmbed={addSocialEmbed}
          onToggleFind={() => setFindOpen((o) => !o)}
        />
      )}

      {findOpen && <FindReplace editor={editor} onClose={() => setFindOpen(false)} />}

      {linkOpen && (
        <div className="flex items-center gap-2 border-b border-kn-border bg-blue-50 px-3 py-2 text-sm">
          <span className="font-semibold">🔗 Link:</span>
          <input
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="https://…"
            className="flex-1 max-w-md rounded border border-kn-border px-2 py-1 outline-none focus:border-kn-red"
          />
          <button type="button" onClick={applyLink} className="rounded bg-kn-red px-3 py-1 font-bold text-white">
            लागू करें
          </button>
          <button
            type="button"
            onClick={() => {
              editorRef.current?.chain().focus().extendMarkRange("link").unsetLink().run();
              setLinkOpen(false);
            }}
            className="rounded border border-kn-border bg-white px-2 py-1 font-semibold hover:bg-kn-gray"
          >
            Link हटाएँ
          </button>
          <button type="button" onClick={() => setLinkOpen(false)} className="px-1 font-bold text-kn-muted hover:text-kn-dark">
            ✕
          </button>
        </div>
      )}

      {/* Link bubble: shows when the cursor is inside a link */}
      <BubbleMenu
        editor={editor}
        pluginKey="linkBubble"
        shouldShow={({ editor }) => editor.isActive("link") && !linkOpen}
      >
        <div className="flex items-center gap-1 rounded-md border border-kn-border bg-white px-2 py-1 text-xs shadow-lg">
          <a
            href={(editor.getAttributes("link").href as string) || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-[220px] truncate text-kn-red underline"
          >
            {(editor.getAttributes("link").href as string) || ""}
          </a>
          <button type="button" onClick={openLinkPanel} className="rounded px-1.5 py-0.5 font-bold hover:bg-kn-gray">
            Edit
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
            className="rounded px-1.5 py-0.5 font-bold text-kn-red hover:bg-kn-gray"
          >
            हटाएँ
          </button>
        </div>
      </BubbleMenu>

      {/* Image bubble: alt text, alignment, width */}
      <BubbleMenu
        editor={editor}
        pluginKey="imageBubble"
        shouldShow={({ editor }) => editor.isActive("figureImage")}
      >
        {imageState && (
          <div className="flex flex-col gap-1.5 rounded-md border border-kn-border bg-white p-2 text-xs shadow-lg">
            <input
              value={imageState.alt}
              onChange={(e) => editor.chain().updateFigureImage({ alt: e.target.value }).run()}
              placeholder="Alt text (SEO के लिए इमेज का वर्णन)"
              className="w-64 rounded border border-kn-border px-2 py-1 outline-none focus:border-kn-red"
            />
            <div className="flex items-center gap-1">
              {(["left", "center", "right", "full"] as FigureAlign[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  title={{ left: "बाएँ (text wrap)", center: "बीच में", right: "दाएँ (text wrap)", full: "पूरी चौड़ाई" }[a]}
                  onClick={() => editor.chain().focus().updateFigureImage({ align: a }).run()}
                  className={`rounded px-2 py-0.5 font-bold ${imageState.align === a ? "bg-kn-red text-white" : "hover:bg-kn-gray"}`}
                >
                  {{ left: "⇤", center: "≡", right: "⇥", full: "⛶" }[a]}
                </button>
              ))}
              <span className="mx-1 h-4 w-px bg-kn-border" />
              {[25, 50, 75, null].map((w) => (
                <button
                  key={String(w)}
                  type="button"
                  title={w ? `${w}% चौड़ाई` : "100% चौड़ाई"}
                  onClick={() => editor.chain().focus().updateFigureImage({ width: w }).run()}
                  className={`rounded px-1.5 py-0.5 font-bold ${imageState.width === w ? "bg-kn-red text-white" : "hover:bg-kn-gray"}`}
                >
                  {w ? `${w}%` : "100%"}
                </button>
              ))}
              <span className="mx-1 h-4 w-px bg-kn-border" />
              <button
                type="button"
                title="इमेज हटाएँ"
                onClick={() => editor.chain().focus().deleteSelection().run()}
                className="rounded px-1.5 py-0.5 font-bold text-kn-red hover:bg-kn-gray"
              >
                🗑
              </button>
            </div>
            <p className="text-[10px] text-kn-muted">Caption: इमेज के नीचे सीधे टाइप करें।</p>
          </div>
        )}
      </BubbleMenu>

      <div className={mode === "normal" ? "" : "flex-1 overflow-y-auto"}>
        <div className={mode === "zen" ? "mx-auto max-w-2xl py-8" : ""}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) void insertUploadedImages(files);
          e.target.value = "";
        }}
      />

      {uploadError && (
        <p className="px-4 py-1 text-xs font-semibold text-kn-red">{uploadError}</p>
      )}

      {/* Status bar */}
      <div className="flex items-center gap-4 border-t border-kn-border bg-neutral-50 px-3 py-1.5 text-[11px] text-kn-muted rounded-b-md">
        <span><strong className="text-kn-dark">{words}</strong> शब्द</span>
        <span><strong className="text-kn-dark">{counts?.chars ?? 0}</strong> अक्षर</span>
        <span>~<strong className="text-kn-dark">{readMins}</strong> मिनट पढ़ने का समय</span>
        <span className="ml-auto hidden sm:inline">
          Ctrl+B bold · Ctrl+K link · Ctrl+F खोजें · इमेज drag-drop करें
        </span>
      </div>
    </div>
  );
}
