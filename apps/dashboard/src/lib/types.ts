import type { Font } from "./fonts";

export type OGElement = (OGPElement | OGDynamicElement | OGDivElement) & {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  rotate: number;
  blur: number;
  border?: {
    color: string;
    width: number;
    style: "outside" | "inside";
  };
  shadow?: {
    color: string;
    width: number;
    blur: number;
    x: number;
    y: number;
  };
};

export interface OGPElement {
  tag: "p";
  content: string;
  color: Color | Gradient;
  fontFamily: Font;
  fontWeight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  align: "left" | "center" | "right";
}

export type OGDynamicElement = Omit<OGPElement, "tag"> & {
  tag: "span";
};

export interface OGDivElement {
  tag: "div";
  radius?: number;
  color: Gradient | Image | Color
}

export type Gradient = {
    type: "gradient"
    start: string;
    end: string;
    angle: number;
    gradient_direction: "linear" | "radial";
  };

export type Image = {
  type: "image"
  src: string;
  size: "cover" | "contain";
}

export type Color = {
  type: "color";
  color: string
}
