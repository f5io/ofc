const Koa = require('koa');
const { resolve, normalize, join, parse } = require('path');
const static = require('koa-static');

const app = new Koa();

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

const handler = () => {
  const root = resolve('./.ofc/server'); 
  return async (ctx, next) => {
    const path = parse(normalize(ctx.path));
    try {
      await require(join(root, path.dir, path.name))(ctx, next);
    } catch (e) {
      // TODO: handle errors better
      console.log(e);
      await next();
    }
  };
};

app.use(assets());
app.use(handler());

module.exports = () => app.listen(3000);

