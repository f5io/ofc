import __ofc_koa from 'koa';
import { compose as __ofc_now_compose } from '@ofc/middleware';

const __ofc_app = new __ofc_koa();

const __ofc_now = handler => (req, res) => {
  const ctx = __ofc_app.createContext(req, res);
  const deployment = ctx.headers['x-now-deployment-url'];

  ctx.params = req.query;
  ctx.deployment = {
    prefix: deployment,
    protocol: deployment.startsWith('localhost') ? 'http://' : 'https://',
  };

  return __ofc_app.handleRequest(ctx, __ofc_now_compose(handler));
};

export default __ofc_now;

