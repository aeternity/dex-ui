const { optimize } = require('svgo');

module.exports = function vueSvgLoader(svg) {
  const { svgo: svgoConfig } = this.getOptions || {};

  if (svgoConfig !== false) {
    // eslint-disable-next-line no-param-reassign
    ({ data: svg } = optimize(svg, {
      path: this.resourcePath,
      ...svgoConfig,
    }));
  }

  return `<template>${svg}</template>`;
};
