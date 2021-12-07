const { defineConfig } = require('@vue/cli-service');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.module.rule('aes')
      .test(/\.aes$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end();
  },
  configureWebpack: {
    plugins: [
      new NodePolyfillPlugin(),
    ],
  },
});
