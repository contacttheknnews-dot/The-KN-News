"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";

// Find & replace over the document text. Matches are located by walking the
// ProseMirror doc; the active match is shown via the editor selection.

type Match = { from: number; to: number };

function findMatches(editor: Editor, query: string): Match[] {
  const results: Match[] = [];
  if (!query) return results;
  const q = query.toLowerCase();
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    const text = node.text.toLowerCase();
    let idx = text.indexOf(q);
    while (idx !== -1) {
      results.push({ from: pos + idx, to: pos + idx + q.length });
      idx = text.indexOf(q, idx + 1);
    }
  });
  return results;
}

export default function FindReplace({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [cursor, setCursor] = useState(0);
  const [total, setTotal] = useState<number | null>(null);

  const jumpTo = (m: Match) => {
    editor.chain().setTextSelection(m).scrollIntoView().run();
  };

  const findNext = () => {
    const matches = findMatches(editor, query);
    setTotal(matches.length);
    if (!matches.length) return;
    const after = editor.state.selection.to;
    const next = matches.find((m) => m.from >= after) ?? matches[0];
    setCursor(matches.indexOf(next) + 1);
    jumpTo(next);
  };

  const replaceOne = () => {
    if (!query) return;
    const matches = findMatches(editor, query);
    setTotal(matches.length);
    if (!matches.length) return;
    const { from, to } = editor.state.selection;
    const selected = matches.find((m) => m.from === from && m.to === to);
    const target = selected ?? matches.find((m) => m.from >= from) ?? matches[0];
    editor.chain().insertContentAt({ from: target.from, to: target.to }, replacement).run();
    // find the next occurrence after the replacement
    setTimeout(findNext, 0);
  };

  const replaceAll = () => {
    if (!query) return;
    const matches = findMatches(editor, query);
    setTotal(matches.length);
    if (!matches.length) return;
    let chain = editor.chain();
    // replace from the end so earlier positions stay valid
    for (const m of [...matches].reverse()) {
      chain = chain.insertContentAt({ from: m.from, to: m.to }, replacement);
    }
    chain.run();
    setTotal(0);
    setCursor(0);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-kn-border bg-amber-50 px-3 py-2 text-sm">
      <input
        autoFocus
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setTotal(null);
          setCursor(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            findNext();
          }
          if (e.key === "Escape") onClose();
        }}
        placeholder="खोजें…"
        className="w-40 rounded border border-kn-border px-2 py-1 outline-none focus:border-kn-red"
      />
      <input
        value={replacement}
        onChange={(e) => setReplacement(e.target.value)}
        placeholder="बदलें…"
        className="w-40 rounded border border-kn-border px-2 py-1 outline-none focus:border-kn-red"
      />
      <button type="button" onClick={findNext} className="rounded border border-kn-border bg-white px-2 py-1 font-semibold hover:bg-kn-gray">
        अगला
      </button>
      <button type="button" onClick={replaceOne} className="rounded border border-kn-border bg-white px-2 py-1 font-semibold hover:bg-kn-gray">
        Replace
      </button>
      <button type="button" onClick={replaceAll} className="rounded border border-kn-border bg-white px-2 py-1 font-semibold hover:bg-kn-gray">
        Replace All
      </button>
      {total !== null && (
        <span className="text-xs text-kn-muted">
          {total === 0 ? "कोई मिलान नहीं" : `${cursor || "–"}/${total}`}
        </span>
      )}
      <button type="button" onClick={onClose} className="ml-auto text-kn-muted hover:text-kn-dark font-bold px-1">
        ✕
      </button>
    </div>
  );
}
