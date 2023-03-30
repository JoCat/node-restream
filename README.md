# node-restream

## Install

Create a new project and install the "node-restream" dependency:

`npm i node-restream`

Or clone this repository if you want to edit the source code

## Usage

```js
import App from "node-restream";

const app = new App({
  inputUrl: "rtmp://localhost:1935/live",
});

app.addOutput({
  url: "rtmp://a.rtmp.youtube.com/live2/your_key",
});

// And other
// app.addOutput({
//   url: "rtmp://twitch_url/your_key",
// });

app.run();
```
