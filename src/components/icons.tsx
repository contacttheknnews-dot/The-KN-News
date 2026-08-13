// Lightweight inline SVG icon set (no icon library dependency).
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 18,
  height: 18,
  fill: "currentColor",
  viewBox: "0 0 24 24",
  "aria-hidden": true as const,
  ...props,
});

export const SearchIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" strokeLinecap="round" />
  </svg>
);

export const MenuIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
  </svg>
);

export const CloseIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
  </svg>
);

export const ChevronDown = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRight = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const EyeIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const ClockIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" strokeLinecap="round" />
  </svg>
);

export const UserIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
  </svg>
);

export const PlayIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);

export const CameraIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 8h3l2-3h6l2 3h3v12H4V8Z" strokeLinejoin="round" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

export const ShareIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="m8.7 10.7 6.6-3.4M8.7 13.3l6.6 3.4" />
  </svg>
);

export const LinkIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" strokeLinecap="round" />
    <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" strokeLinecap="round" />
  </svg>
);

export const MailIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const PhoneIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
  </svg>
);

export const MapPinIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const TrendingIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m3 17 6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------- Social ---------- */

export const FacebookIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M14 8h3V5h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z" />
  </svg>
);

export const InstagramIcon = (props: P) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const YouTubeIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.9C18.2 5 12 5 12 5s-6.2 0-7.8.3a2.6 2.6 0 0 0-1.8 1.9A27 27 0 0 0 2 12c0 1.6.1 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.9C5.8 19 12 19 12 19s6.2 0 7.8-.3a2.6 2.6 0 0 0 1.8-1.9c.3-1.6.4-3.2.4-4.8s-.1-3.2-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
  </svg>
);

export const XIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M17.7 3H21l-7.3 8.3L22 21h-6.7l-5.2-6.3L4 21H.7l7.8-8.9L0 3h6.9l4.7 5.7L17.7 3Zm-1.2 16h1.9L6.9 4.9H4.9L16.5 19Z" />
  </svg>
);

export const TelegramIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M21.9 4.6 18.9 19c-.2 1-.8 1.2-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-.9.5l.3-4.6L18.2 7c.4-.3-.1-.5-.6-.2L7.3 13.3l-4.4-1.4c-1-.3-1-1 .2-1.4L20.5 3.3c.8-.3 1.5.2 1.4 1.3Z" />
  </svg>
);

export const WhatsAppIcon = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.5-.6c.1-.2.2-.3.1-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.2 2.1-.6 3.5a12 12 0 0 0 4.6 4.9c1.6.9 2.8 1.1 3.8.8.6-.2 1.4-.7 1.6-1.4.2-.7.2-1.2.1-1.3-.1-.1-.3-.2-.6-.3Z" />
  </svg>
);

export const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  x: XIcon,
  telegram: TelegramIcon,
  whatsapp: WhatsAppIcon,
} as const;
