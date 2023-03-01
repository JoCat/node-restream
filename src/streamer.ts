import { spawn, ChildProcess } from "child_process";
import pathToFfmpeg from "ffmpeg-static";
import Core from "./core";

export default class Streamer {
  private ffmpeg: ChildProcess[] = [];

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
      const instance = spawn(pathToFfmpeg!, this.ffmpegFlags(output), {
        stdio: "pipe",
      });

      instance.stderr.on("data", (message) => {
        console.log(`[source #${index}] ${message}`);
      });

      this.ffmpeg.push(instance);

      console.log(`Source #${index} is up and running`);
    });
    console.log("All sources are running");
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
    this.ffmpeg.forEach((stream) => stream.stdin.write(frame));
  }
}
