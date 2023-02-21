import { spawn, ChildProcess } from "child_process";
import pathToFfmpeg from "ffmpeg-static";
import Core from "./core";

export default class Streamer {
  private ffmpeg!: ChildProcess;

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
    this.ffmpeg = spawn(pathToFfmpeg!, this.ffmpegFlags(), {
      stdio: ["pipe", process.stdout, process.stderr],
    });

    this.ffmpeg.on("close", (code) => {
      console.log("[FFMPEG] Closed.", code);
      process.exit();
    });
    this.ffmpeg.on("error", (error) => {
      console.log(`[FFMPEG] Error: ${error}`);
      process.exit();
    });
  }

  ffmpegFlags() {
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
      ["-b:a", "96k"]
    );

    flags.push(...this.getOutputs());

    return flags.flat();
  }

  getOutputs() {
    return this.outputs.map((output) => ["-f", "flv", output]);
  }

  putFrame(frame: Buffer) {
    this.ffmpeg.stdin.write(frame);
  }
}
