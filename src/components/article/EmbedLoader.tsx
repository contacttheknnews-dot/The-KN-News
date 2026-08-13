"use client";

// Loads the platform widget scripts that hydrate social embeds inside
// article bodies (blockquote.twitter-tweet / .instagram-media / div.fb-post).
// Only the scripts actually needed by this article are loaded.

import { useEffect } from "react";

declare global {
  interface Window {
    twttr?: { widgets?: { load: () => void } };
    instgrm?: { Embeds?: { process: () => void } };
    FB?: { XFBML?: { parse: () => void } };
  }
}

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.src = src;
  s.async = true;
  document.body.appendChild(s);
}

export default function EmbedLoader({ html }: { html: string }) {
  useEffect(() => {
    if (html.includes("twitter-tweet")) {
      if (window.twttr?.widgets) window.twttr.widgets.load();
      else loadScript("https://platform.twitter.com/widgets.js", "twitter-wjs");
    }
    if (html.includes("instagram-media")) {
      if (window.instgrm?.Embeds) window.instgrm.Embeds.process();
      else loadScript("https://www.instagram.com/embed.js", "instagram-embedjs");
    }
    if (html.includes("fb-post") || html.includes("fb-video")) {
      if (window.FB?.XFBML) {
        window.FB.XFBML.parse();
      } else {
        if (!document.getElementById("fb-root")) {
          const root = document.createElement("div");
          root.id = "fb-root";
          document.body.appendChild(root);
        }
        loadScript(
          "https://connect.facebook.net/hi_IN/sdk.js#xfbml=1&version=v19.0",
          "facebook-jssdk"
        );
      }
    }
  }, [html]);

  return null;
}
