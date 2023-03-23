"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var nodestream_exports = {};
__export(nodestream_exports, {
  Ref: () => Ref,
  default: () => nodestream_default
});
module.exports = __toCommonJS(nodestream_exports);

// src/elements/ImageElement.ts
var ImageElement = class {
  constructor(options) {
    this.options = options;
  }
  type = 0 /* Image */;
  deconstructor() {
  }
  getInput() {
    return ["-i", this.options.src];
  }
  getFilter() {
    const [x, y] = this.options.position || [0, 0];
    return `overlay=${x}:${y}`;
  }
};

// src/ref.ts
var Ref = class {
  #ref;
  constructor(value) {
    this.#ref = value;
  }
  getRef() {
    return this.#ref;
  }
  setRef(v) {
    this.#ref = v;
  }
};

// src/elements/TextElement.ts
var import_rgb_hex = __toESM(require("rgb-hex"), 1);
var import_path = require("path");
var import_crypto = require("crypto");
var import_fs = require("fs");
var TextElement = class {
  constructor(options) {
    this.options = options;
  }
  type = 1 /* Text */;
  tempFilePath;
  deconstructor() {
    this.deleteTempFile();
  }
  getInput() {
    return [];
  }
  getFilter() {
    const { text, font, fontFile, fontSize, color, position } = this.options;
    const params = [];
    if (color) {
      if (Array.isArray(color)) {
        const [r, g, b, a = 1] = color;
        params.push(`fontcolor=#${(0, import_rgb_hex.default)(r, g, b, a)}`);
      } else {
        params.push(`fontcolor=#${(0, import_rgb_hex.default)(color)}`);
      }
    }
    if (font) {
      params.push(`font=${font}`);
    }
    if (fontFile) {
      params.push(`fontfile=${fontFile}`);
    }
    if (fontSize) {
      params.push(`fontsize=${fontSize}`);
    }
    if (position) {
      params.push(`x=${position[0]}:y=${position[1]}`);
    }
    if (text instanceof Ref || typeof text === "function") {
      params.push(`textfile=${this.generateTempFilePath()}:reload=1`);
      this.setWriter(text);
    } else {
      params.push(`text=${text}`);
    }
    return `drawtext=${params.join(":")}`;
  }
  generateTempFilePath() {
    if (this.tempFilePath)
      return this.tempFilePath;
    this.tempFilePath = `./tmp-${(0, import_crypto.randomUUID)()}`;
    this.write("");
    return this.tempFilePath;
  }
  deleteTempFile() {
    if (this.tempFilePath) {
      (0, import_fs.rmSync)((0, import_path.resolve)(this.tempFilePath));
      this.tempFilePath = void 0;
    }
  }
  write(data) {
    if (this.tempFilePath) {
      (0, import_fs.writeFileSync)((0, import_path.resolve)(this.tempFilePath), data);
    }
  }
  setWriter(text) {
    let callback;
    if (text instanceof Ref) {
      callback = text.getRef;
    } else {
      callback = text;
    }
    setInterval(() => this.write(callback()), 1e3);
  }
};

// src/streamer.ts
var import_child_process = require("child_process");
var import_ffmpeg_static = __toESM(require("ffmpeg-static"), 1);
var Streamer = class {
  constructor(core) {
    this.core = core;
  }
  instances = [];
  elements = [];
  exit = false;
  addElement(element) {
    this.elements.push(element);
  }
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
    this.exit = true;
    this.instances.forEach(({ instance }) => instance.kill());
    this.elements.forEach((el) => el.deconstructor());
  }
  startStream(output, index) {
    if (!import_ffmpeg_static.default) {
      throw new Error("Ffmpeg is not compiled for this platform");
    }
    const instance = (0, import_child_process.spawn)(import_ffmpeg_static.default, this.ffmpegFlags(output));
    const stream = {
      instance,
      output,
      index
    };
    instance.stderr.on("data", (message) => {
      console.log(`[source #${index}] ${message}`);
    });
    instance.on("close", () => {
      if (this.exit)
        return;
      this.instances.splice(this.instances.indexOf(stream));
      this.startStream(output, index);
      console.log(`Source #${index} restarted`);
    });
    this.instances.push(stream);
  }
  ffmpegFlags(output) {
    if (this.core.options.audioUrl.length === 0) {
      throw new Error("Audio url not set!");
    }
    const flags = [
      ["-r", `${this.core.options.fps}`],
      ["-i", this.core.options.audioUrl]
    ];
    if (this.elements.length > 0) {
      this.elements.forEach((element) => {
        flags.push(element.getInput());
      });
      const filter = [
        `color=size=${this.core.options.size.join("x")}[layer0]`
      ];
      let currentPrefix = "layer0";
      let currentIndex = 0;
      this.elements.forEach((element) => {
        const filterStr = element.getFilter();
        const nextPrefix = `layer${++currentIndex}`;
        if (element.type === 0 /* Image */) {
          filter.push(
            `[${currentPrefix}][${currentIndex}:v]${filterStr}[${nextPrefix}]`
          );
        } else {
          filter.push(`[${currentPrefix}]${filterStr}[${nextPrefix}]`);
        }
        currentPrefix = nextPrefix;
      });
      flags.push(
        // Set output
        ["-filter_complex", filter.join(";")],
        ["-map", `[${currentPrefix}]`],
        ["-map", "0:a"]
      );
    }
    flags.push(
      // Output conf
      ["-c:v", "libx264"],
      ["-preset", "veryfast"],
      ["-maxrate", "3000k"],
      ["-bufsize", "6000k"],
      ["-pix_fmt", "yuv420p"],
      ["-g", "50"],
      ["-c:a", "aac"],
      ["-b:a", "128k"],
      ["-f", "flv", output],
      ["-loglevel", "error"]
    );
    return flags.flat();
  }
  putFrame(frame) {
    this.instances.forEach((stream) => {
      stream.instance.stdin?.write(frame, (err) => {
        if (!err)
          return;
        console.log(err);
      });
    });
  }
};

// src/core.ts
var Core = class {
  options = {
    size: [1280, 720],
    fps: 30,
    audioUrl: ""
  };
  outputs = [];
  streamer;
  constructor(options) {
    this.options = { ...this.options, ...options };
    this.streamer = new Streamer(this);
  }
  run() {
    this.streamer.run();
  }
  setAudioUrl(audioUrl) {
    this.options.audioUrl = audioUrl;
  }
  setFps(fps) {
    this.options.fps = fps;
  }
  setWindowSize(size) {
    this.options.size = size;
  }
  addElement(element) {
    this.streamer.addElement(element);
  }
  addImageElement(options) {
    this.streamer.addElement(new ImageElement(options));
  }
  addTextElement(options) {
    this.streamer.addElement(new TextElement(options));
  }
  addOutput(uri) {
    this.outputs.push(uri);
  }
};

// index.ts
var nodestream_default = Core;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Ref
});
