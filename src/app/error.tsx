"use client";

import Link from "next/link";
import { useEffect } from "react";

// Branded error boundary — shown when a page throws during render.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error so production render failures aren't invisible.
    // Replace with a reporting service (e.g. Sentry) when one is added.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-2xl font-extrabold">
          The <span className="bg-kn-red text-white px-1.5 py-0.5 rounded-sm">KN</span> News
        </p>
        <h1 className="mt-6 text-xl font-extrabold">कुछ गड़बड़ हो गई!</h1>
        <p className="mt-2 text-sm text-kn-muted">
          पेज लोड करते समय एक तकनीकी समस्या आई। कृपया दोबारा कोशिश करें।
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-kn-red px-5 py-2 text-sm font-bold text-white hover:bg-kn-red-dark transition-colors"
          >
            दोबारा कोशिश करें
          </button>
          <Link
            href="/"
            className="rounded-full border border-kn-border px-5 py-2 text-sm font-medium hover:bg-kn-gray transition-colors"
          >
            होम पर जाएं
          </Link>
        </div>
      </div>
    </div>
  );
}
