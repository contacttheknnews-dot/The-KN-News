import { Node, nodePasteRule } from "@tiptap/core";

// Social media embeds stored as the platform's standard embed markup
// (blockquote.twitter-tweet, blockquote.instagram-media, div.fb-post).
// The public site hydrates them with the platform script (EmbedLoader);
// inside the editor they render as a labelled placeholder card.

export type EmbedPlatform = "twitter" | "instagram" | "facebook";

export const TWITTER_RE = /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w{1,20}\/status\/\d+[^\s]*/g;
export const INSTAGRAM_RE = /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[\w-]+[^\s]*/g;
export const FACEBOOK_RE = /https?:\/\/(?:www\.)?(?:facebook\.com\/(?:[\w.]+\/(?:posts|videos)\/|watch\/?\?v=|reel\/)[^\s]+|fb\.watch\/[^\s]+)/g;

export function detectPlatform(url: string): EmbedPlatform | null {
  if (new RegExp(TWITTER_RE.source).test(url)) return "twitter";
  if (new RegExp(INSTAGRAM_RE.source).test(url)) return "instagram";
  if (new RegExp(FACEBOOK_RE.source).test(url)) return "facebook";
  return null;
}

const PLATFORM_LABEL: Record<EmbedPlatform, string> = {
  twitter: "𝕏 Twitter/X पोस्ट",
  instagram: "📷 Instagram पोस्ट",
  facebook: "📘 Facebook पोस्ट",
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    socialEmbed: {
      setSocialEmbed: (attrs: { platform: EmbedPlatform; url: string }) => ReturnType;
    };
  }
}

export const SocialEmbed = Node.create({
  name: "socialEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      platform: { default: "twitter" },
      url: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "blockquote.twitter-tweet",
        getAttrs: (el) => {
          const url = (el as HTMLElement).querySelector("a")?.getAttribute("href") || "";
          return url ? { platform: "twitter", url } : false;
        },
      },
      {
        tag: "blockquote.instagram-media",
        getAttrs: (el) => {
          const url =
            (el as HTMLElement).getAttribute("data-instgrm-permalink") ||
            (el as HTMLElement).querySelector("a")?.getAttribute("href") ||
            "";
          return url ? { platform: "instagram", url } : false;
        },
      },
      {
        tag: "div.fb-post",
        getAttrs: (el) => {
          const url = (el as HTMLElement).getAttribute("data-href") || "";
          return url ? { platform: "facebook", url } : false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { platform, url } = node.attrs as { platform: EmbedPlatform; url: string };
    if (platform === "instagram") {
      return [
        "blockquote",
        {
          class: "instagram-media",
          "data-instgrm-permalink": url,
          "data-instgrm-version": "14",
        },
        ["a", { href: url }, url],
      ];
    }
    if (platform === "facebook") {
      return ["div", { class: "fb-post", "data-href": url }];
    }
    return [
      "blockquote",
      { class: "twitter-tweet", "data-dnt": "true" },
      ["a", { href: url }, url],
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const { platform, url } = node.attrs as { platform: EmbedPlatform; url: string };
      const dom = document.createElement("div");
      dom.className = "rte-embed-card";
      dom.contentEditable = "false";
      const title = document.createElement("div");
      title.className = "rte-embed-title";
      title.textContent = PLATFORM_LABEL[platform] ?? "Embed";
      const link = document.createElement("div");
      link.className = "rte-embed-url";
      link.textContent = url;
      dom.append(title, link);
      return { dom };
    };
  },

  addCommands() {
    return {
      setSocialEmbed:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: TWITTER_RE,
        type: this.type,
        getAttributes: (match) => ({ platform: "twitter", url: match[0] }),
      }),
      nodePasteRule({
        find: INSTAGRAM_RE,
        type: this.type,
        getAttributes: (match) => ({ platform: "instagram", url: match[0] }),
      }),
      nodePasteRule({
        find: FACEBOOK_RE,
        type: this.type,
        getAttributes: (match) => ({ platform: "facebook", url: match[0] }),
      }),
    ];
  },
});
