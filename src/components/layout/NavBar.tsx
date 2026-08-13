"use client";

// Main navigation: sticky red bar, horizontal scroll on smaller screens,
// hamburger drawer + search on mobile. Active category highlighted.

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MenuIcon, CloseIcon, SearchIcon, ChevronDown } from "@/components/icons";

type Item = { label: string; href: string };

export default function NavBar({
  items,
  moreItems,
}: {
  items: Item[];
  moreItems: Item[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [q, setQ] = useState("");

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="sticky top-0 z-40 bg-kn-charcoal text-white shadow-md">
      <div className="container-site flex items-center">
        {/* mobile hamburger */}
        <button
          className="lg:hidden p-2.5 -ml-2"
          aria-label="मेन्यू खोलें"
          onClick={() => setOpen(true)}
        >
          <MenuIcon width={22} height={22} />
        </button>

        {/* desktop nav — scrollable strip */}
        <nav className="hidden lg:flex items-stretch overflow-x-auto no-scrollbar flex-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-3 py-3 text-[15px] font-semibold transition-colors ${
                isActive(item.href)
                  ? "bg-kn-red text-white"
                  : "hover:bg-white/10 text-neutral-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {/* और देखें dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button className="flex items-center gap-1 whitespace-nowrap px-3 py-3 text-[15px] font-semibold hover:bg-white/10">
              और देखें <ChevronDown width={14} height={14} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full w-52 bg-white text-kn-dark shadow-lg rounded-b-md overflow-hidden border border-kn-border">
                {moreItems.map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="block px-4 py-2.5 text-sm hover:bg-kn-gray hover:text-kn-red"
                    onClick={() => setMoreOpen(false)}
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* mobile brand strip filler */}
        <p className="lg:hidden flex-1 text-center font-extrabold text-lg">
          The <span className="bg-kn-red px-1.5 rounded-sm">KN</span> News
        </p>

        {/* search icon */}
        <Link href="/search" aria-label="खोजें" className="p-2.5 -mr-2 hover:text-neutral-300">
          <SearchIcon width={20} height={20} />
        </Link>
      </div>

      {/* ---- Mobile drawer ---- */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white text-kn-dark shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-kn-border">
              <p className="font-extrabold text-lg">
                The <span className="bg-kn-red text-white px-1.5 rounded-sm">KN</span> News
              </p>
              <button aria-label="बंद करें" onClick={() => setOpen(false)} className="p-2">
                <CloseIcon width={22} height={22} />
              </button>
            </div>
            <form onSubmit={submitSearch} className="p-4 border-b border-kn-border">
              <div className="flex items-center gap-2 rounded-md border border-kn-border px-3 py-2">
                <SearchIcon width={16} height={16} className="text-kn-muted" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="The KN News पर खोजें…"
                  className="w-full text-sm outline-none"
                />
              </div>
            </form>
            <nav className="flex-1 overflow-y-auto py-2">
              {[...items, ...moreItems].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-5 py-3 text-[15px] font-medium border-b border-neutral-100 ${
                    isActive(item.href) ? "text-kn-red font-bold" : "text-kn-dark"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
