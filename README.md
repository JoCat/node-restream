# nodestream

```js
// Example

import App from "nodestream";
import { resolve } from "path";

const app = new App({
  size: [1280, 720],
  fps: 30,
  audioUrl: "http://localhost:8000/live",
});

// or
// app.setAudioUrl("http://83.136.232.247:8903/live");

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
