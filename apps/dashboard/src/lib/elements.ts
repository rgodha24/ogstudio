import type { CSSProperties } from "react";
import type { OGElement } from "./types";
import { hexAlphaToRgba } from "./colors";

/**
 * The initial elements to render in the editor.
 *
 * It only contains a single element, a white background that
 * takes the entire width and height of the editor.
 */
export const INITIAL_ELEMENTS: OGElement[] = [
  {
    id: createElementId(),
    tag: "div",
    name: "Box",
    x: 0,
    y: 0,
    width: 1200,
    height: 630,
    visible: true,
    rotate: 0,
    blur: 0,
    color: { type: "color", color: "#ffffff" },
  },
];

export function createElementId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Create a new element with a random ID and automatically centered on the canvas.
 */
export function createElement(element: Partial<OGElement>): OGElement {
  // @ts-expect-error typescript is not smart enough
  return {
    ...element,
    id: createElementId(),
    x: (1200 - (element.width ?? 0)) / 2,
    y: (630 - (element.height ?? 0)) / 2,
  };
}

/**
 * Generate the CSS styles for an element. This will also be used by Satori to
 * render the elements to an SVG, so we have to only use CSS properties that
 * are supported: https://github.com/vercel/satori#css
 */
export function createElementStyle(element: OGElement): CSSProperties {
  const boxShadows: string[] = [];
  let textShadow: string | undefined;

  // Borders are generated as box shadows to avoid taking up extra space and
  // allow for more flexibility
  if (element.border) {
    boxShadows.push(
      `0 0 0 ${element.border.width}px${
        element.border.style === "inside" ? " inset" : ""
      } ${element.border.color}`,
    );
  }

  if (element.shadow) {
    if (element.tag === "p" || element.tag === "span") {
      textShadow = `${element.shadow.x}px ${element.shadow.y}px ${element.shadow.blur}px ${element.shadow.color}`;
    } else {
      boxShadows.push(
        `${element.shadow.x}px ${element.shadow.y}px ${element.shadow.blur}px ${element.shadow.width}px ${element.shadow.color}`,
      );
    }
  }

  // There is a set of base styles that are shared by all elements
  let base: CSSProperties = {
    position: "absolute",
    top: `${element.y}px`,
    left: `${element.x}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform:
      element.rotate !== 0 ? `rotate(${element.rotate}deg)` : undefined,
    boxShadow: boxShadows.length ? boxShadows.join(", ") : undefined,
    filter: element.blur !== 0 ? `blur(${element.blur}px)` : undefined,
  };

  if (element.tag === "p" || element.tag === "span") {
    base = {
      ...base,
      display: "flex",
      fontFamily: element.fontFamily,
      fontWeight: element.fontWeight,
      fontSize: `${element.fontSize}px`,
      lineHeight: element.lineHeight,
      letterSpacing: `${element.letterSpacing}px`,
      justifyContent:
        element.align === "center"
          ? "center"
          : element.align === "right"
            ? "flex-end"
            : "flex-start",
      // By default, Satori sets a margin top and bottom on some elements:
      // https://github.com/vercel/satori/blob/29fe2e4a9676a1ba41c361ec1a547d6de329b039/src/handler/presets.ts#L15
      marginTop: 0,
      marginBottom: 0,
      textShadow,
    };

    if (element.color.type === "gradient") {
      // taken from the `gradients` example on satori playground
      base = {
        ...base,
        backgroundImage:
          element.color.gradient_direction === "radial"
            ? `radial-gradient(${element.color.start}, ${element.color.end})`
            : `linear-gradient(${element.color.angle}deg, ${element.color.start}, ${element.color.end})`,
        backgroundClip: "text",
        // @ts-expect-error
        "-webkit-background-clip": "text",
        color: "transparent",
      };
    } else {
      base = {
        ...base,
        color: hexAlphaToRgba(element.color.color),
      };
    }
  }

  if (element.tag === "div") {
    base = {
      ...base,
      display: "flex",
      borderRadius: element.radius ? `${element.radius}px` : undefined,
    };

    if (element.color.type === "gradient") {
      base = {
        ...base,
        background:
          element.color.gradient_direction === "radial"
            ? `radial-gradient(${element.color.start}, ${element.color.end})`
            : `linear-gradient(${element.color.angle}deg, ${element.color.start}, ${element.color.end})`,
      };
    } else if (element.color.type === "color") {
      base = {
        ...base,
        background: hexAlphaToRgba(element.color.color),
      };
    } else {
      // noop for images
    }
  }

  // Filter out undefined values
  return Object.fromEntries(
    Object.entries(base).filter(([, value]) => value !== undefined),
  );
}

export function createImgElementStyle(element: OGElement): CSSProperties {
  let base: CSSProperties = {};

  if (element.tag === "div" && element.color.type === "image") {
    base = {
      ...base,
      objectFit: element.color.size,
      borderRadius: element.radius ? `${element.radius}px` : undefined,
    };
  }

  // Filter out undefined values
  return Object.fromEntries(
    Object.entries(base).filter(([, value]) => value !== undefined),
  );
}

export function getDynamicTextKeys(elements: OGElement[]) {
  return elements
    .filter(
      (element) =>
        element.tag === "span" ||
        (element.tag === "div" &&
          element.color.type === "image" &&
          !element.color.src.startsWith("http")),
    )
    .map((element) => {
      if (element.tag === "div") {
        // we already know it's an image based background
        return (element.color as any).src;
      } else {
        return element.content;
      }
    });
}
