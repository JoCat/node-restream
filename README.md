# node-restream

## Install

Create a new project and install the "node-restream" dependency:

`npm i node-restream`

Or clone this repository if you want to edit the source code

## Usage

```js
import App from "node-restream";
import { resolve } from "path";

const app = new App({
  inputUrl: "rtmp://localhost:1935/live",
});

// DEV
app.addOutput({
  url: "rtmp://localhost:1935/stream/hello",
});

app.run();
```
