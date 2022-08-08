const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "zegocloud_prebuilt_webrtc/access_token",
    createProxyMiddleware({
      target: "https://choui-prebuilt.herokuapp.com/access_token",
      changeOrigin: true,
    })
  );
};
