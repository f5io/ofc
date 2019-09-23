const { resolve, join } = require('path');
const fs = require('fs').promises;
const mdx = require('@mdx-js/mdx');

const plugin = () => ({
  name: '@ofc/plugin-mdx',
  async transform(code, id) {
    if (!id.endsWith('.md') && !id.endsWith('.mdx')) return;
    return mdx(code);
  },
});

module.exports = plugin;
