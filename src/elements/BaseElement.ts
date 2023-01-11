import { CanvasRenderingContext2D } from "canvas";

export interface BaseElementOptions {
  position: [number, number];
}

export interface BaseElement {
  draw: (context: CanvasRenderingContext2D) => void;
}
