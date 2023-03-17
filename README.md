# nodestream

## Install

Create a new project and install the "nodestream" dependency:

`npm i nodestream`

Or clone this repository if you want to edit the source code

## Usage

```js
import App from "nodestream";
import { resolve } from "path";

const app = new App({
  size: [1280, 720],
  fps: 30,
  audioUrl: "http://localhost:8000/live",
});

app.addImageElement({
  position: [0, 0],
  src: resolve("./assets/background.jpg"),
});

app.addImageElement({
  position: [1080, 25],
  src: resolve("./assets/stream-logo.png"),
});

app.addTextElement({
  text: () => new Date().toLocaleTimeString(),
  color: [0, 0, 0],
  position: [20, 20],
  fontSize: 32,
});

app.addOutput("rtmp://localhost:1935/stream/hello");

app.run();
```
