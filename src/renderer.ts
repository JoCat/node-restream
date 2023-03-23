import { Canvas, CanvasRenderingContext2D, createCanvas } from "canvas";
import Core from "./core";
import { BaseElement } from "./elements/BaseElement";

export default class Renderer {
  private canvas: Canvas;
  private context: CanvasRenderingContext2D;
  private elements: BaseElement[] = [];

  private fps: number;
  private fpsDelta: number;
  private size: [number, number];

  constructor(private core: Core) {
    this.fps = core.options.fps;
    this.size = core.options.size;

    const [x, y] = this.size;
    this.canvas = createCanvas(x, y);
    this.context = this.canvas.getContext("2d");

    // Для генерации излишков кадров (исключаем пролаги)
    this.fpsDelta = 1.1;
  }

  run() {
    setInterval(() => this.frame(), 1e3 / (this.fps * this.fpsDelta));
  }

  frame() {
    const [x, y] = this.size;
    this.context.fillStyle = "rgb(255, 255, 255)";
    this.context.fillRect(0, 0, x, y);

    this.elements.forEach((element) => element.draw(this.context));

    this.core.streamer.putFrame(this.canvas.toBuffer("image/jpeg"));
  }

  addElement(element: BaseElement) {
    this.elements.push(element);
  }
}
