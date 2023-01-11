import Core from "./core";
import { ImageElement } from "./elements/ImageElement";
import { TextElement } from "./elements/TextElement";

const app = new Core();

app.addElement(
  new ImageElement({
    position: [0, 0],
    url: "http://picsum.photos/1280/720",
  })
);

app.addElement(
  new TextElement({
    text: () => new Date().toLocaleTimeString(),
    color: [0, 0, 0],
    position: [20, 680],
    fontSize: 64,
  })
);

app.run();
