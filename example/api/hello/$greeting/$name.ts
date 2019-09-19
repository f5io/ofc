import { Context } from 'koa';

type Params = {
  greeting: string;
  name: string;
};

type Ctx = Context & { params: Params };

export default async (ctx: Ctx) => {
  ctx.body = `${ctx.params.greeting}, ${ctx.params.name}!`;
};
