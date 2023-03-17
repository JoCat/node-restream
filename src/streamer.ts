import { spawn, ChildProcess } from "child_process";
import pathToFfmpeg from "ffmpeg-static";
import Core from "./core";

interface Stream {
  instance: ChildProcess;
  output: string;
  index: number;
}

export default class Streamer {
  private instances: Stream[] = [];

  private fps: number;
  private size: [number, number];
  private audioUrl: string;
  private outputs: string[];

  constructor(core: Core) {
    this.fps = core.options.fps;
    this.size = core.options.size;
    this.audioUrl = core.options.audioUrl;
    this.outputs = core.outputs;
  }

  run() {
    this.outputs.forEach((output, index) => {
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

  startStream(output: string, index: number) {
    const instance = spawn(pathToFfmpeg!, this.ffmpegFlags(output));

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

  ffmpegFlags(output: string) {
    const flags: (string | string[])[] = [
      // Video pipe input
      ["-f", "rawvideo"],
      ["-pixel_format", "bgra"],
      ["-video_size", this.size.join("x")],
      ["-framerate", `${this.fps}`],
      ["-i", "-"],
    ];

    if (this.audioUrl.length > 0) {
      flags.push(["-i", this.audioUrl]);
    }

    flags.push(
      // Output conf
      ["-vcodec", "libx264"],
      ["-acodec", "aac"],
      ["-pix_fmt", "yuv420p"],
      ["-preset", "veryfast"],
      ["-g:v", `${this.fps}`],
      ["-b:v", "2500k"],
      ["-b:a", "96k"],
      ["-f", "flv", output],
      ["-loglevel", "error"]
      // ["-loglevel", "level+info"]
    );

    return flags.flat();
  }

  putFrame(frame: Buffer) {
    this.instances.forEach((stream) => stream.instance.stdin.write(frame));
  }
}
