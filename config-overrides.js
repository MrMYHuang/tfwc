const customizeCra = require("customize-cra");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin-myh");

module.exports = customizeCra.override(
  // add webpack bundle visualizer if BUNDLE_VISUALIZE flag is enabled
  process.env.BUNDLE_VISUALIZE === 1 && customizeCra.addBundleVisualizer(),

  // add an alias for "ag-grid-react" imports
  customizeCra.addWebpackAlias({
    "fs": 'memfs'
  }),

  customizeCra.addWebpackPlugin(new NodePolyfillPlugin()),
  customizeCra.removeModuleScopePlugin(),
);
