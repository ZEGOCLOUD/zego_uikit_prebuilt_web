export default {
  entry: "src/sdk/index.tsx",
  doc: {
    themeConfig: { mode: "dark" },
    base: "/your-repo",
  },
  file: "ZegoClient",
  esm: {
    type: "rollup",
    minify: true,
  },
  umd: {
    name: "ZegoClient",
    minFile: true,
    sourcemap: true,
  },
};
