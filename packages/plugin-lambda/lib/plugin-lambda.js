const { resolve, dirname } = require('path');
const fetch = require('@ofc/transform-fetch');
const babel = require('rollup-plugin-babel');

const plugin = ({
  input,
  production,
}) => {
  return {
    input,
    production,
    plugins: [
      fetch(),
      babel({
        exclude: /node_modules/,
        extensions: [ '.js', '.ts' ],
        presets: [
          '@babel/preset-typescript',
          [ '@babel/preset-env', { targets: { node: true } } ],
        ], 
      }),
    ],
    outputOptions: {
      dir: resolve('./.ofc/server', input),
      format: 'cjs',
    },
  };
};

module.exports = plugin;
