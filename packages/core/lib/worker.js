//const { parentPort, threadId, workerData } = require('worker_threads');
const { join, parse, resolve } = require('path');
const fs = require('fs').promises;
const rollup = require('rollup');
const json = require('rollup-plugin-json');
const replace = require('rollup-plugin-replace');
const node_resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const threadId = 1;

const basePlugins = ({
  production,
  replaceOptions = {},
  resolveOptions = {},
  namedExportOptions = {},
}) => [
  json(),
  replace({
    'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
    'OFC_PORT': '3000',
    ...replaceOptions,
  }),
  node_resolve({
    preferBuiltins: true,
    jail: process.cwd(),
    ...resolveOptions,
  }),
  commonjs({
    include: 'node_modules/**',
    namedExports: namedExportOptions,
  }),
];

const generate = ({
  parentPort,
  production,
  watch,
  input,
  plugins,
  outputOptions,
  replaceOptions,
  resolveOptions,
  namedExportOptions,
}) => {
  const { dir, name } = parse(input);
  const uri = '/' + join(dir, name);
  const absolutePath = resolve(join(outputOptions.dir, name + '.js'));

  const cache = (() => {
    let inner = null; 
    return {
      set(value) {
        inner = value;
        return fs
          .writeFile(absolutePath + '.cache.json', JSON.stringify(value), 'utf8')
          .catch(() => {});
      },
      get() {
        if (inner) return inner;
        return fs
          .readFile(absolutePath + '.cache.json', 'utf8')
          .then(JSON.parse)
          .catch(() => null);
      }
    }
  })();

  const emitEvent = event =>
    parentPort.postMessage({
      ...event,
      threadId,
      absolutePath,
      uri,
      input,
    });

  const defaultOptions = !production
    ? { preserveModules: true, treeshake: false }
    : {};

  const allPlugins = [
    ...plugins,
    ...basePlugins({
      production,
      replaceOptions,
      resolveOptions,
      namedExportOptions
    }),
  ];

  const options = {
    ...defaultOptions,
    onwarn: warn => {}, // suppress for now
    input,
    plugins: allPlugins,
    output: outputOptions,
  };

  if (!production && watch) {
    const watcher = rollup.watch(options);
    watcher.on('event', ({ result, ...event }) => {
      emitEvent(event);
      if (event.code === 'BUNDLE_END') {
        options.cache = result.cache;
        result.write(options)
          .then(() => cache.set(options.cache))
          .then(() => emitEvent({ ...event, code: 'WRITE_END' }));
      }
    });
  }

  return cache.get() 
    .then(cache => {
      options.cache = cache;
      return rollup.rollup(options);
    })
    .then(bundle => bundle.write(options))
    .then(() => cache.set(options.cache))
    .then(() => ({ input, uri, absolutePath }));

};

const toArray = arr => Array.isArray(arr) ? arr : [ arr ];

const prepare = ({ parentPort, input, pluginName, production, watch }) => {
  const plugin = require(pluginName);
  const pluginOutput = plugin({ input, production, watch });
  return toArray(pluginOutput)
    .map(po => generate({ parentPort, production, watch, ...po }));
};

const run = ({ parentPort, workerData }) =>
  Promise.allSettled(prepare({ parentPort, ...workerData }))
    .then(results => {
      parentPort.postMessage({
        code: 'PLUGIN_SETTLED',
        threadId,
        ...workerData,
        results,
      });
      return results;
    });

module.exports = { run };
