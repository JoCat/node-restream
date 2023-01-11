import { CanvasRenderingContext2D } from "canvas";
import { BaseElement } from "./BaseElement";

export interface TextElementOptions {
  text: string | (() => string);
  font?: string;
  fontSize?: number;
  /**
   * rgb(a)
   */
  color: [number, number, number] | [number, number, number, number];
  /**
   * x, y
   */
  position: [number, number];
}

export class TextElement implements BaseElement {
  options: TextElementOptions;

  constructor(options: TextElementOptions) {
    this.options = options;
  }

  public draw(context: CanvasRenderingContext2D) {
    const { text, font, fontSize, color, position } = this.options;

    const [r, g, b, a = 1] = color;
    context.fillStyle = `rgba(${[r, g, b, a].join(",")})`;

    context.font = [fontSize || 18, font || "sans-serif"].join("px ");

    let textResult;
    if (typeof text === "function") textResult = text();
    else textResult = text;

    const [x, y] = position;
    context.fillText(textResult, x, y);
  }
}
