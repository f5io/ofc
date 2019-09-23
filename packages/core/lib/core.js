const { Worker, MessageChannel } = require('worker_threads')
const fg = require('fast-glob')
const fs = require('fs').promises
const { join, resolve } = require('path')

const createPool = require('@paybase/pool');

const pool = createPool({
  createProcess: () => require('./worker'),
  handler: (process, { parentPort, workerData }) =>
    process.run({ parentPort, workerData }),
});

const server = require('@ofc/server')

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

  const workers = files.flat()
    .map(([ input, pluginName ]) => {
      const { port1, port2 } = new MessageChannel();
      return pool.run({
        parentPort: port1,
        workerData: {
          input,
          pluginName,
          production,
          watch: !production && serve,
        }
      }).then(result => [ port2, result ]);
    })



  //const { port1, port2 } = new MessageChannel()

  //const workers = files.flat().map(([input, pluginName]) => {
    //return new Promise((resolve, reject) => {
      //const worker = new Worker(join(__dirname, 'worker.js'), {
        //workerData: {
          //input,
          //pluginName,
          //production,
          //watch: !production && serve,
        //},
      //})

      //worker.on('error', err => {
        //console.log(err)
        //if (reject) reject(err)
        //reject = null
      //})
      //worker.on('message', event => {
        //if (event.code === 'PLUGIN_SETTLED') {
          //if (resolve) {
            //console.log('complete, terminating worker')
            //resolve(event)
            //worker.terminate()
          //}
        //}
      //})

      //if (!production && serve) {
        //resolve(worker)
        //resolve = null
      //}
    //})
  //})

  const result = await Promise.all(workers)
  if (!production && serve) {
    result.forEach(worker => {
      worker.on('message', message => port1.postMessage(message))
    })
    server({ messagePort: port2, production })
  } else if (serve) {
    server({ manifest: result, production })
  } else {
    console.dir(result, { depth: null })
    process.exit()
  }
}

exports.start = start
