const { defineConfig } = require('@vue/cli-service');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const parseBool = (val) => (val ? JSON.parse(val) : false);

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.plugin('define').tap((options) => {
      const definitions = { ...options[0] };
      definitions['process.env.UNFINISHED_FEATURES'] = parseBool(process.env.VUE_APP_UNFINISHED_FEATURES);
      return [definitions];
    });
    config.module.rule('aes')
      .test(/\.aes$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end();

    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .delete('type')
      .delete('generator')
      .oneOf('vue-component')
      .resourceQuery(/vue-component/)
      .use('vue-loader')
      .loader('vue-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]',
      });
  },
  configureWebpack: {
    plugins: [
      new NodePolyfillPlugin(),
    ],
  },
});
