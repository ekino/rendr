const withCss = require("@zeit/next-css");

const nextConfig = {
  cssModules: false,
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
    // optionally configure a port for the onDemandEntries WebSocket, not needed by default
    websocketPort: 7002,
    // optionally configure a proxy path for the onDemandEntries WebSocket, not need by default
    // websocketProxyPath: '/hmr',
    // optionally configure a proxy port for the onDemandEntries WebSocket, not need by default
    // websocketProxyPort: 7002,
  },
  pageExtensions: ["jsx", "js", "ts", "tsx"],
  webpack(config, { buildId, dev, isServer, defaultLoaders }) {
    return config;
  },
};

module.exports = withCss(nextConfig);
