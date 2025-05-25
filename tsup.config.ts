import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node22",
  sourcemap: true,
  minify: true,
  clean: true,
  dts: true,
});
