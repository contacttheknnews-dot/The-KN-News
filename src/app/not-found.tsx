import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-2xl font-extrabold">
        The <span className="bg-kn-red text-white px-1.5 py-0.5 rounded-sm">KN</span> News
      </p>
      <h1 className="mt-8 text-7xl md:text-8xl font-extrabold text-kn-red">404</h1>
      <p className="mt-4 text-xl font-bold text-kn-dark">
        “यह खबर शायद कहीं और चली गई है!”
      </p>
      <p className="mt-2 text-sm text-kn-muted max-w-md">
        जिस पेज को आप ढूंढ रहे हैं वह मौजूद नहीं है, हटा दिया गया है या उसका पता बदल
        गया है।
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-kn-red px-6 py-3 text-sm font-bold text-white hover:bg-kn-red-dark transition-colors"
        >
          होम पर जाएं
        </Link>
        <Link
          href="/latest"
          className="rounded-md border-2 border-kn-dark px-6 py-3 text-sm font-bold text-kn-dark hover:bg-kn-dark hover:text-white transition-colors"
        >
          ताज़ा खबर देखें
        </Link>
      </div>
    </div>
  );
}
