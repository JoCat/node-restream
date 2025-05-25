import Streamer from "./streamer";

export interface CoreOptions {
  inputUrl: string;
  silentLogging: boolean;
}

export interface Output {
  url: string;
  flags?: string[];
}

export default class Core {
  options: CoreOptions = {
    inputUrl: "",
    silentLogging: true,
  };

  outputs: Output[] = [];

  streamer: Streamer;

  constructor(options?: Partial<CoreOptions>) {
    this.options = { ...this.options, ...options };

    this.streamer = new Streamer(this);
  }

  run() {
    if (!this.options.inputUrl) {
      throw new Error("Input URL is not set");
    }

    this.streamer.run();
  }

  addOutput(output: Output) {
    this.outputs.push(output);
  }
}
