const { resolve } = require('path');
const babel = require('rollup-plugin-babel');

const plugin = ({
  input,
  production,
}) => {
  return {
    input,
    production,
    plugins: [
      babel({
        exclude: 'node_modules/**',
        extensions: [ '.js', '.ts' ],
        presets: [
          '@babel/preset-typescript',
          [ '@babel/preset-env', { targets: { node: true } } ],
        ], 
      }),
    ],
    outputOptions: {
      dir: resolve('./.ofc/server'),
      format: 'cjs',
    },
  };
};

module.exports = plugin;
