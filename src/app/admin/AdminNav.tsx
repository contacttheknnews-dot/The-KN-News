"use client";

// Role-aware admin navigation grouped by area.

import Link from "next/link";
import { usePathname } from "next/navigation";

type Group = { title: string; items: { label: string; href: string; roles?: string[] }[] };

const GROUPS: Group[] = [
  {
    title: "Content",
    items: [
      { label: "All News", href: "/admin/articles", roles: ["EDITOR", "REPORTER", "AUTHOR"] },
      { label: "Add News", href: "/admin/articles/new", roles: ["EDITOR", "REPORTER", "AUTHOR"] },
      { label: "Breaking News", href: "/admin/breaking", roles: ["EDITOR"] },
      { label: "Categories", href: "/admin/categories", roles: ["EDITOR"] },
      { label: "Tags", href: "/admin/tags", roles: ["EDITOR"] },
      { label: "Authors", href: "/admin/authors", roles: ["EDITOR"] },
      { label: "Media Library", href: "/admin/media", roles: ["EDITOR", "REPORTER", "AUTHOR"] },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Comments", href: "/admin/comments", roles: ["EDITOR", "MODERATOR"] },
      { label: "Newsletter", href: "/admin/newsletter", roles: ["EDITOR"] },
      { label: "Inbox / Inquiries", href: "/admin/inquiries", roles: ["EDITOR", "AD_MANAGER"] },
    ],
  },
  {
    title: "Media",
    items: [
      { label: "Videos", href: "/admin/videos", roles: ["EDITOR"] },
      { label: "Photo Gallery", href: "/admin/gallery", roles: ["EDITOR"] },
    ],
  },
  {
    title: "Monetization",
    items: [
      { label: "Advertisements", href: "/admin/ads", roles: ["AD_MANAGER", "EDITOR"] },
      { label: "Google AdSense", href: "/admin/adsense", roles: ["AD_MANAGER", "EDITOR"] },
    ],
  },
  {
    title: "Website",
    items: [
      { label: "Settings", href: "/admin/settings", roles: ["EDITOR"] },
      { label: "Users & Roles", href: "/admin/users", roles: [] },
      { label: "Activity Log", href: "/admin/activity", roles: [] },
    ],
  },
];

export default function AdminNav({ role }: { role: string }) {
  const pathname = usePathname();
  const canSee = (roles?: string[]) =>
    role === "SUPER_ADMIN" || !roles || roles.includes(role);

  return (
    <nav className="flex-1 py-3">
      {GROUPS.map((group) => {
        const visible = group.items.filter((i) => canSee(i.roles));
        if (!visible.length) return null;
        return (
          <div key={group.title} className="mb-4">
            <p className="px-5 text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5">
              {group.title}
            </p>
            {visible.map((item) => {
              const active =
                item.href === "/admin/articles"
                  ? pathname === item.href || /^\/admin\/articles\/\d+/.test(pathname)
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-5 py-2 text-sm transition-colors ${
                    active
                      ? "bg-kn-red text-white font-bold"
                      : "hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
