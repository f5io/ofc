import { compose } from '@ofc/middleware';
import bodyParser from 'koa-bodyparser';

export default compose(
  bodyParser(),
  async (ctx) => {
    console.log(ctx.request.body);
    ctx.body = { bar: 'baz' };
  }
);
