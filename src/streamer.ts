import { spawn, ChildProcess } from "child_process";
import pathToFfmpeg from "ffmpeg-static";
import Core, { Output } from "./core";

interface Stream {
  instance: ChildProcess;
  output: Output;
  index: number;
}

export default class Streamer {
  private instances: Stream[] = [];

  constructor(private core: Core) {}

  run() {
    this.core.outputs.forEach((output, index) => {
      this.startStream(output, index);
      console.log(`Source #${index} is up and running`);
    });

    process.once("SIGINT", () => this.killAllStreams());
    process.once("SIGTERM", () => this.killAllStreams());

    console.log("All sources are running");
  }

  killAllStreams() {
    this.instances.forEach(({ instance }) => instance.kill());
  }

  startStream(output: Output, index: number) {
    if (!pathToFfmpeg) {
      throw new Error("ffmpeg not found");
    }

    const instance = spawn(pathToFfmpeg, this.ffmpegFlags(output));

    const stream = {
      instance,
      output,
      index,
    };

    instance.stderr.on("data", (message) => {
      console.log(`[source #${index}] ${message}`);
    });

    instance.stdin.on("error", (message) => {
      console.error(`[source #${index}] stdin error`, message);
    });

    instance.on("close", () => {
      this.instances.splice(this.instances.indexOf(stream));
      this.startStream(output, index);
      console.log(`Source #${index} restarted`);
    });

    this.instances.push(stream);
  }

  ffmpegFlags(output: Output) {
    const flags = ["-i", this.core.options.inputUrl];

    flags.push("-c", "copy");

    if (output.flags) flags.push(...output.flags);

    flags.push("-f", "flv", output.url);

    if (this.core.options.silentLogging) {
      flags.push("-loglevel", "error");
    }

    return flags;
  }
}
