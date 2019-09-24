const Koa = require('koa');
const { resolve, normalize, relative, join, parse } = require('path');
const static = require('koa-static');
const { PassThrough } = require('stream');
const { compose, uriToRegex } = require('./utils');

/*
 * TODO
 * - add body parser
 */

const app = new Koa();

const matchers = new Map();

const assets = () => {
  const handler = static(resolve('./.ofc'));
  return async (ctx, next) => {
    if (ctx.path.startsWith('/assets')) {
      if (ctx.path.endsWith('commonjs-proxy')) {
        ctx.type = '.js'
      }
      await handler(ctx, next);
    } else {
      await next();
    }
  }
}

const handler = root => {
  return async (ctx, next) => {
    const { params, handler } = [...matchers.entries()].reduce((acc, [re, h]) => {
      const r = re.exec(ctx.path);
      if (r) {
        const params = r.groups || {}

        if (!acc.handler)
          return {
            params,
            handler: h,
          };

        if (Object.keys(params).length < Object.keys(acc.params).length) {
          acc = { params, handler: h };
        }
      }
      return acc;
    }, {})

    if (handler) {
      ctx.params = params;
      await handler(ctx, next);
    } else {
      await next();
    }
  }
}

const invalidate = ({ input, uri, absolutePath }) => {
  if (!absolutePath || !absolutePath.includes('.ofc/server')) return false;
  delete require.cache[absolutePath];
  const re = uriToRegex(uri);
  matchers.set(re, require(absolutePath));
  console.log(`mounted :: ${input} on uri :: ${uri} with regex :: ${re}`);
}

const development = (app, messagePort) => {
  const handler = async (ctx, next) => {
    if (ctx.path.startsWith('/_ofc_sse')) {
      const output = new PassThrough();
      output.push('\n');

      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      ctx.req.on('close', () => {
        messagePort.off('message', onMessage)
      });

      const onMessage = event => {
        if (event.input === ctx.query.w) {
          output.push(`id: ${event.threadId}\n`);
          output.push(`event: ${event.code}\n`);
          output.push(`data: ${event.input}\n\n`);
        }
      }

      ctx.body = output;

      messagePort.on('message', onMessage);
    } else {
      await next();
    }
  }

  //messagePort.on('message', ({ code, input, ...event }) => {
    //if (code === 'WRITE_END') {
      //invalidate({ input, ...event })
    //}
  //})

  app.use(handler);
}

module.exports = ({ messagePort, manifest, production }) => {
  const root = resolve('./.ofc/server');

  if (manifest)
    manifest
      .flatMap(x => x.results)
      .map(x => x.value)
      .forEach(invalidate);

  app.use(assets());

  if (!production) development(app, messagePort);

  app.use(handler(root));

  app.listen(3000);
};
