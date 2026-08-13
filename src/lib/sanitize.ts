import "server-only";
import sanitizeHtml from "sanitize-html";

// Server-side allowlist for article body HTML. The TipTap editor only
// produces these tags, so anything else (scripts, event handlers, foreign
// iframes) is hostile input — e.g. a compromised staff account — and gets
// stripped before it ever reaches the database.

const ALLOWED_IFRAME_HOSTS = [
  "www.youtube.com",
  "www.youtube-nocookie.com",
  "youtube.com",
  "player.vimeo.com",
  "www.facebook.com", // facebook post/video embed plugin
];

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "a", "span", "sub", "sup", "mark",
      "ul", "ol", "li",
      "blockquote", "figure", "figcaption", "img", "iframe",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "colgroup", "col",
      "pre", "code", "hr", "br", "div",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
      iframe: [
        "src", "width", "height", "allow", "allowfullscreen", "frameborder",
        "title", "loading", "referrerpolicy", "scrolling",
      ],
      blockquote: ["class", "cite", "data-*", "lang", "dir"],
      div: ["class", "data-*"],
      figure: ["class", "data-*"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      ol: ["start", "type"],
      code: ["class"],
      pre: ["class"],
      span: ["class"],
    },
    allowedClasses: {
      blockquote: ["twitter-tweet", "instagram-media", "tiktok-embed"],
      div: ["callout", "fb-post", "fb-video"],
      figure: ["align-left", "align-center", "align-right", "align-full"],
      span: [],
      code: [/^language-[\w-]+$/],
      pre: [],
    },
    // headline level is reserved for the article title
    transformTags: {
      h1: "h2",
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        const external = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
          },
        };
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
    allowedIframeHostnames: ALLOWED_IFRAME_HOSTS,
    disallowedTagsMode: "discard",
  });
}
