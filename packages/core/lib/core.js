const { Worker, MessageChannel } = require('worker_threads');
const fg = require('fast-glob');
const fs = require('fs').promises;
const { join, resolve, relative } = require('path');

const createPool = require('@paybase/pool');

const threadPool = createPool({
  createProcess: () => new Worker(join(__dirname, 'wrapper.js')),
  handler: (worker, { workerData }) => new Promise((resolve, reject) => {
    worker.postMessage(workerData);
    resolve(worker);
  }),
});

const start = async ({
  watch = false,
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
      return threadPool.run({
        workerData: {
          input,
          pluginName,
          production,
          watch,
        }
      });
    });

  const { port1, port2 } = new MessageChannel();
  const result = await Promise.all(workers);
  const ports = new Set();
  result.forEach(port => {
    if (!ports.has(port)) {
      port.on('message', message => port1.postMessage(message));
      ports.add(port);
    }
  });

  const output = await ((len) => {
    return new Promise((resolve) => {
      let i = 0;
      let results = [];
      port2.on('message', message => {
        if (message.code === 'PLUGIN_SETTLED') {
          i++; 
          results = results.concat(message.results);
          if (i === len) resolve(results);
        } else if (watch) {
          const { code, input, ...event } = message;
          console.log(`event :: ${code} :: ${input}`);
          if (code === 'ERROR') {
            console.log(event);
          }
        }
      });
    });
  })(result.length);

  console.log(output);

  const constructRegex = uri => {
    const replacements = [];
    return {
      replacements,
      uri: uri
        .replace(/@([^\/]+)/g, (m, group) => {
          replacements.push(group);
          return `(?<${group}>[^/]+?)`;
        })
        .replace(/\/index$/, '')
        .replace(/$/, '/?'),
      };
  }

  const toSrcDest = output => output
    .filter(({ value }) => value.absolutePath.includes('.ofc/server'))
    .map(({ value: { uri, absolutePath } }) => {
      const re = constructRegex(uri);
      const qs = re.replacements.map(k => `${k}=$${k}`);
      return {
        src: re.uri,
        dest: '/' + relative(process.cwd(), absolutePath)
        + (qs.length ? `?${qs.join('&')}` : ''),
      };
    })
    .concat([
      { src: '/assets/(.*)', dest: '/.ofc/assets/$1' },
      { src: '/(.*)', status: 404 }
    ]);

  const base = {
    version: 2,
    builds: [
      { src: '.ofc/server/**/*.js', use: '@now/node' },
      { src: '.ofc/assets/**', use: '@now/static' }
    ],
    routes: toSrcDest(output),
  };

  await fs.writeFile(resolve('now.ofc.json'), JSON.stringify(base, null, 2));
  
  console.log('done', watch);
  if (!watch) process.exit();

}

exports.start = start;
