import { BaseElement } from "./elements/BaseElement";
import Renderer from "./renderer";
import Streamer from "./streamer";

export interface CoreOptions {
  /**
   * width, height
   */
  size: [number, number];

  fps: number;
}

export default class Core {
  options: CoreOptions = {
    size: [1280, 720],
    fps: 30,
  };
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
}
