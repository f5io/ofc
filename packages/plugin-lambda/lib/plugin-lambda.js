const { resolve, dirname, parse } = require('path');
const fetch = require('@ofc/transform-fetch');
const now = require('@ofc/transform-now');
const babel = require('rollup-plugin-babel');

const plugin = ({
  input,
  production,
}) => {
  const { dir } = parse(input);
  return {
    input,
    production,
    plugins: [
      fetch(),
      now(),
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
      dir: resolve('./.ofc/server', dir),
      format: 'cjs',
    },
  };
};

module.exports = plugin;
