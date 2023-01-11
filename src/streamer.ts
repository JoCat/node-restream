import { spawn, ChildProcess } from "child_process";
import pathToFfmpeg from "ffmpeg-static";
import Core from "./core";

export default class Streamer {
  private ffmpeg!: ChildProcess;

  private size: [number, number];

  constructor(private core: Core) {
    this.size = core.options.size;
  }

  run() {
    // Если там, куда хотите транслировать есть ссылка и ключ, то вводим в формате 'url/key'
    const rtmpUrl = "rtmp://a.rtmp.youtube.com/live2/jwtx-yry9-hhcc-50dt-4t81";
    const audioUrl = "https://radiorecord.hostingradio.ru/dub96.aacp";

    this.ffmpeg = spawn(pathToFfmpeg!, this.ffmpegFlags(audioUrl, rtmpUrl), {
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

  ffmpegFlags(audioUrl: string, rtmpUrl: string) {
    return [
      // Video pipe input
      ["-thread_queue_size", "0"],
      ["-f", "rawvideo"],
      ["-pixel_format", "bgra"],
      ["-video_size", this.size.join("x")],
      ["-framerate", "30"],
      ["-i", "-"],

      // Audio
      ["-thread_queue_size", "0"],
      ["-i", audioUrl],

      // Output conf
      ["-vcodec", "libx264"],
      ["-acodec", "aac"],
      ["-pix_fmt", "yuv420p"],
      ["-preset", "veryfast"],
      ["-g:v", "30"],
      ["-b:v", "2500k"],
      ["-b:a", "96k"],

      // Output
      ["-f", "flv"],
      rtmpUrl,
    ].flat();
  }

  async putFrame() {
    this.ffmpeg.stdin.write(this.core.renderer.canvas.toBuffer("raw"));
  }
}
