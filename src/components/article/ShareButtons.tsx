"use client";

// Social sharing row for article pages.

import { useState } from "react";
import {
  FacebookIcon,
  XIcon,
  WhatsAppIcon,
  TelegramIcon,
  LinkIcon,
} from "@/components/icons";

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookIcon,
      cls: "bg-[#1877f2]",
    },
    {
      label: "X",
      href: `https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`,
      Icon: XIcon,
      cls: "bg-black",
    },
    {
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      Icon: WhatsAppIcon,
      cls: "bg-[#25d366]",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: TelegramIcon,
      cls: "bg-[#229ed9]",
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-bold text-kn-dark mr-1">शेयर करें:</span>
      {links.map(({ label, href, Icon, cls }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} पर शेयर करें`}
          className={`${cls} text-white h-9 w-9 rounded-full flex items-center justify-center hover:opacity-85 transition-opacity`}
        >
          <Icon width={16} height={16} />
        </a>
      ))}
      <button
        onClick={copy}
        aria-label="लिंक कॉपी करें"
        className="h-9 rounded-full bg-kn-gray text-kn-dark px-3 flex items-center gap-1.5 text-xs font-semibold hover:bg-neutral-200 transition-colors"
      >
        <LinkIcon width={14} height={14} />
        {copied ? "कॉपी हो गया!" : "Copy Link"}
      </button>
    </div>
  );
}
