const { Worker, MessageChannel } = require('worker_threads');
const fg = require('fast-glob');
const fs = require('fs').promises;
const { join, resolve } = require('path');
const server = require('@ofc/server');

const createPool = require('@paybase/pool');

const pool = createPool({
  createProcess: () => require('./worker'),
  handler: (process, { parentPort, workerData }) =>
    process.run({ parentPort, workerData, threadId: 1 }),
});

const threadPool = createPool({
  createProcess: () => new Worker(join(__dirname, 'wrapper.js')),
  handler: (worker, { workerData }) => new Promise((resolve, reject) => {
    const cleanup = () => {
      worker.off('message', onMessage);
      worker.off('error', onError);
    };
    const onMessage = event => {
      if (event.code === 'PLUGIN_SETTLED') {
        resolve([ worker, event ]);
        cleanup();
      }
    };
    const onError = err => {
      reject(err);
      cleanup();
    };
    worker.on('message', onMessage);
    worker.on('error', onError);
    worker.postMessage(workerData);
  }),
});


const start = async ({
  serve = true,
  production = false,
  plugins = [
    [ '.{md,mdx}', '@ofc/plugin-mdx' ],
    [ '.{jsx,tsx}', '@ofc/plugin-react' ],
    [ '.{js,ts}', '@ofc/plugin-lambda' ],
  ],
}) => {
  const ignoreFile = await fs
    .readFile(resolve('.ofcignore'), 'utf8')
    .catch(() => ({ split: () => [] }))

  const ignore = ['!node_modules/**/*', '!.ofc/**/*'].concat(
    ignoreFile
      .split('\n')
      .filter(x => x)
      .map(x => `!${x}`),
  )

  const files = await Promise.all(
    plugins.map(([ext, pluginName]) =>
      fg([`**/*${ext}`, ...ignore]).then(files => files.map(input => [input, pluginName])),
    ),
  );

  //const workers = files.flat()
    //.map(([ input, pluginName ]) => {
      //const { port1, port2 } = new MessageChannel();
      //return pool.run({
        //parentPort: port1,
        //workerData: {
          //input,
          //pluginName,
          //production,
          //watch: !production && serve,
        //}
      //}).then(result => [ port2, result ]);
    //});

  const workers = files.flat()
    .map(([ input, pluginName ]) => {
      return threadPool.run({
        workerData: {
          input,
          pluginName,
          production,
          watch: !production && serve,
        }
      });
    });

  const { port1, port2 } = new MessageChannel();
  const result = await Promise.all(workers);
  const manifest = result.map(([, result]) => result);
  if (!production && serve) {
    result.forEach(([ port ]) => {
      port.on('message', message => port1.postMessage(message));
    });
    server({ messagePort: port2, manifest, production });
  } else if (serve) {
    server({ manifest, production });
  } else {
    console.dir(result, { depth: null });
    process.exit();
  }
}

exports.start = start;
