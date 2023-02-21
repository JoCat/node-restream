import { BaseElement } from "./elements/BaseElement";
import { ImageElement, ImageElementOptions } from "./elements/ImageElement";
import { TextElement, TextElementOptions } from "./elements/TextElement";
import Renderer from "./renderer";
import Streamer from "./streamer";

export interface CoreOptions {
  /**
   * width, height
   */
  size: [number, number];

  fps: number;

  audioUrl: string;
}

export default class Core {
  options: CoreOptions = {
    size: [1280, 720],
    fps: 30,
    audioUrl: "",
  };

  outputs: string[] = [];

  renderer: Renderer;
  streamer: Streamer;

  constructor(options?: Partial<CoreOptions>) {
    this.options = { ...this.options, ...options };

    this.streamer = new Streamer(this);
    this.renderer = new Renderer(this);
  }

  run() {
    this.streamer.run();
    this.renderer.run();
  }

  addElement(element: BaseElement) {
    this.renderer.addElement(element);
  }

  addImageElement(options: ImageElementOptions) {
    this.renderer.addElement(new ImageElement(options));
  }

  addTextElement(options: TextElementOptions) {
    this.renderer.addElement(new TextElement(options));
  }

  addOutput(uri: string) {
    this.outputs.push(uri);
  }
}
