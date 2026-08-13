import { Node, mergeAttributes } from "@tiptap/core";

// Image as <figure><img/><figcaption>…</figcaption></figure> with alt text,
// alignment (left/center/right/full) and width presets. The caption is
// editable inline; an empty caption is hidden by CSS on the public site.

export type FigureAlign = "left" | "center" | "right" | "full";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figureImage: {
      setFigureImage: (attrs: { src: string; alt?: string }) => ReturnType;
      updateFigureImage: (attrs: Partial<{ alt: string; align: FigureAlign; width: number | null }>) => ReturnType;
    };
  }
}

export const FigureImage = Node.create({
  name: "figureImage",
  group: "block",
  content: "inline*",
  isolating: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      align: { default: "center" },
      width: { default: null }, // 25 | 50 | 75 | null (=100)
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        contentElement: "figcaption",
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector("img");
          if (!img?.getAttribute("src")) return false;
          const cls = (el as HTMLElement).className || "";
          const align = (/align-(left|right|center|full)/.exec(cls)?.[1] ?? "center") as FigureAlign;
          const width = Number(/w-(25|50|75)/.exec(cls)?.[1]) || null;
          return { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "", align, width };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (el) => ({
          src: (el as HTMLElement).getAttribute("src"),
          alt: (el as HTMLElement).getAttribute("alt") || "",
          align: "center",
          width: null,
        }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const cls = [`align-${node.attrs.align}`, node.attrs.width ? `w-${node.attrs.width}` : ""]
      .filter(Boolean)
      .join(" ");
    return [
      "figure",
      mergeAttributes(HTMLAttributes, { class: cls }),
      ["img", { src: node.attrs.src, alt: node.attrs.alt || "" }],
      ["figcaption", 0],
    ];
  },

  addCommands() {
    return {
      setFigureImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
      updateFigureImage:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attrs),
    };
  },
});
