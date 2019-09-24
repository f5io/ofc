const { resolve, join } = require('path');
const fs = require('fs').promises;
const mdx = require('@mdx-js/mdx');

const plugin = () => ({
  name: '@ofc/plugin-mdx',
  async transform(code, id) {
    if (!id.endsWith('.md') && !id.endsWith('.mdx')) return;
    const jsx = await mdx(code);
    
    return `import { mdx } from '@mdx-js/react';
    ${jsx}`;
  },
});

module.exports = plugin;
