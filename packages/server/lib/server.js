const Koa = require('koa');
const { resolve, normalize, relative, join, parse } = require('path');
const static = require('koa-static');
const { PassThrough } = require('stream');

const app = new Koa();

const matchers = new Map();

const assets = () => {
  const handler = static(resolve('./.ofc')); 
  return async (ctx, next) => {
    if (ctx.path.startsWith('/assets')) {
      await handler(ctx, next);
    } else {
      await next();
    }
  };
};

const handler = (root) => {
  return async (ctx, next) => {
    const path = ctx.path.slice(1);
    if (matchers.has(path)) {
      await matchers.get(path)(ctx, next);
    } else {
      await next();
    }
  };
};

const invalidate = ({ input, absolutePath }) => {
  if (!absolutePath || !absolutePath.includes('.ofc/server')) return false;
  delete require.cache[absolutePath];
  const { name, dir, base, ext } = parse(input);
  matchers.set(join(dir, name), require(absolutePath));
  if (name === 'index') {
    matchers.set(dir, require(absolutePath));
  }
  console.log(`reinitialised :: ${input}`);
};

const development = (app, messagePort) => {
  
  const handler = async (ctx, next) => {
    if (ctx.path.startsWith('/_ofc_sse')) {
      const output = new PassThrough();
      output.push('\n');

      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      ctx.req.on('close', () => {
        messagePort.off('message', onMessage); 
      });

      const onMessage = event => {
        if (event.input === ctx.query.w) {
          output.push(`id: ${event.threadId}\n`);
          output.push(`event: ${event.code}\n`);
          output.push(`data: ${event.input}\n\n`);
        }
      };

      ctx.body = output;
    
      messagePort.on('message', onMessage);
    } else {
      await next();
    }
  };

  messagePort.on('message', ({ code, input, ...event }) => {
    if (code === 'WRITE_END') {
      console.log({ code, input, ...event });
      invalidate({ input, ...event });
    }
  });

  app.use(handler);

};

module.exports = ({
  messagePort,
  manifest,
  production,
}) => {
  const root = resolve('./.ofc/server'); 

  manifest
    .flatMap(x => x.results)
    .map(x => x.value)
    .forEach(invalidate);

  app.use(assets());

  if (!production)
    development(app, messagePort);

  app.use(handler(root));

  app.listen(3000);
};

