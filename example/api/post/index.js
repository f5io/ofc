import { compose } from '@ofc/server/lib/utils';
import bodyParser from 'koa-bodyparser';

export default compose(
  bodyParser(),
  async (ctx) => {
    console.log(ctx.request.body);
    ctx.body = { bar: 'baz' };
  }
);
