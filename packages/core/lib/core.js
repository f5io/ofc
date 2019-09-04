const rollup = require('rollup');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const basePlugins = (replaceOptions = {}, namedExportOptions = {}) => console.log(replaceOptions, namedExportOptions) || [
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    ...replaceOptions,
  }),
  resolve({ preferBuiltins: true }),
  commonjs({
    include: 'node_modules/**',
    namedExports: namedExportOptions,
  }),
];

const generate = async ({
  input,
  plugins,
  outputOptions,
  replaceOptions,
  namedExportOptions,
}) => {
  const bundle = await rollup.rollup({
    input,
    plugins: [
      ...plugins,
      ...basePlugins(replaceOptions, namedExportOptions),
    ],
  });

  return {
    bundle,
    write: () => bundle.write({ output: outputOptions }),
    ...await bundle.generate({ output: outputOptions }),
  };
};

exports.generate = generate;

const fg = require('fast-glob');
const fs = require('fs').promises;
const pluginReact = require('plugin-react');
const pluginLambda = require('plugin-lambda');
const path = require('path');

const write = async (isDev = true) => {
  const plugins = [
    [ '.{jsx,tsx}', pluginReact ],
    [ '.{js,ts}', pluginLambda ],
  ];


  const ignoreFile = await fs.readFile(path.resolve('.ofcignore'), 'utf8').catch(() => '');
  const ignore = [ '!node_modules/**/*', '!.ofc/**/*' ]
    .concat(ignoreFile.split('\n').filter(x => x).map(x => `!${x}`));

  const files = await Promise.all(
    plugins.map(
      ([ ext, plugin ]) => fg([ `**/*${ext}`, ...ignore ])
        .then(files => files.map(f => [ f, plugin ]))
    )
  );

  const bundles = await Promise.all(
    files.flat()
      .flatMap(([ f, plugin ]) => plugin(f))
      .map(generate)
  );

  if (isDev) {
    // TODO: do hot module shizzle
  }

  await Promise.all(
    bundles.map(({ write }) => write())
  );

};

exports.write = write;



