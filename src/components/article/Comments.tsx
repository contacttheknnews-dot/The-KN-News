"use client";

// Comment list + form. Approved comments come pre-rendered from the server;
// new comments enter moderation before appearing.

import { useActionState, useState, useTransition } from "react";
import {
  submitComment,
  likeComment,
  reportComment,
  type ActionResult,
} from "@/app/actions/public";
import { formatHindiDateTime } from "@/lib/utils";

export type CommentItem = {
  id: number;
  name: string;
  body: string;
  likes: number;
  createdAt: string;
  replies: CommentItem[];
};

function CommentForm({
  articleId,
  parentId,
  onDone,
}: {
  articleId: number;
  parentId?: number;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitComment,
    null
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="articleId" value={articleId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input
        type="text"
        name="name"
        required
        maxLength={60}
        placeholder="आपका नाम"
        className="w-full rounded-md border border-kn-border px-3 py-2.5 text-sm outline-none focus:border-kn-red"
      />
      <textarea
        name="body"
        required
        rows={3}
        maxLength={2000}
        placeholder="अपनी टिप्पणी लिखें…"
        className="w-full rounded-md border border-kn-border px-3 py-2.5 text-sm outline-none focus:border-kn-red resize-y"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-kn-red px-5 py-2 text-sm font-bold text-white hover:bg-kn-red-dark disabled:opacity-60"
        >
          {pending ? "भेजा जा रहा है…" : "टिप्पणी भेजें"}
        </button>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm text-kn-muted hover:text-kn-dark">
            रद्द करें
          </button>
        )}
      </div>
      {state && (
        <p className={`text-xs ${state.ok ? "text-green-700" : "text-kn-red"}`} role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}

function SingleComment({
  comment,
  articleId,
  depth = 0,
}: {
  comment: CommentItem;
  articleId: number;
  depth?: number;
}) {
  const [replying, setReplying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [reported, setReported] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <div className={depth > 0 ? "ml-6 md:ml-10 border-l-2 border-kn-border pl-4" : ""}>
      <div className="py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-kn-red-light text-kn-red font-bold text-sm">
            {comment.name.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-bold">{comment.name}</p>
            <p className="text-[11px] text-kn-muted">{formatHindiDateTime(comment.createdAt)}</p>
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
          {comment.body}
        </p>
        <div className="mt-2 flex items-center gap-4 text-xs text-kn-muted">
          <button
            onClick={() => {
              if (liked) return;
              setLiked(true);
              startTransition(() => likeComment(comment.id));
            }}
            className={`font-semibold hover:text-kn-red ${liked ? "text-kn-red" : ""}`}
          >
            👍 {comment.likes + (liked ? 1 : 0)}
          </button>
          {depth === 0 && (
            <button onClick={() => setReplying((v) => !v)} className="font-semibold hover:text-kn-red">
              जवाब दें
            </button>
          )}
          <button
            onClick={() => {
              if (reported) return;
              setReported(true);
              startTransition(() => reportComment(comment.id));
            }}
            className="hover:text-kn-red"
          >
            {reported ? "रिपोर्ट किया गया" : "रिपोर्ट करें"}
          </button>
        </div>
        {replying && (
          <div className="mt-3">
            <CommentForm articleId={articleId} parentId={comment.id} onDone={() => setReplying(false)} />
          </div>
        )}
      </div>
      {comment.replies.map((r) => (
        <SingleComment key={r.id} comment={r} articleId={articleId} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function Comments({
  articleId,
  comments,
}: {
  articleId: number;
  comments: CommentItem[];
}) {
  return (
    <section aria-label="टिप्पणियां" className="mt-10">
      <h2 className="text-xl font-bold border-b-2 border-kn-red pb-2 mb-4">
        टिप्पणियां ({comments.length})
      </h2>
      <div className="bg-kn-gray rounded-lg p-4 md:p-5 mb-6">
        <h3 className="text-sm font-bold mb-3">अपनी राय दें</h3>
        <CommentForm articleId={articleId} />
      </div>
      {comments.length === 0 ? (
        <p className="text-sm text-kn-muted">अभी कोई टिप्पणी नहीं। सबसे पहले आप लिखें!</p>
      ) : (
        <div className="divide-y divide-kn-border">
          {comments.map((c) => (
            <SingleComment key={c.id} comment={c} articleId={articleId} />
          ))}
        </div>
      )}
    </section>
  );
}
