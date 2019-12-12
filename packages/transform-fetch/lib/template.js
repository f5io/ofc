import __ofc_node_fetch from 'node-fetch';
import { compose as __ofc_fetch_compose } from '@ofc/middleware';
import url from 'url';
import { join } from 'path';

const __ofc_fetch_url = { prefix: null, protocol: null };

const __ofc_fetch = (u, ...rest) => {
  const parsed = url.parse(u);
  if (!parsed.protocol && !parsed.hostname && __ofc_fetch_url.prefix != null) {
    return __ofc_node_fetch(
      __ofc_fetch_url.protocol + join(__ofc_fetch_url.prefix, u), 
      ...rest,
    );
  }
  return __ofc_node_fetch(u, ...rest);
};

const __ofc_fetch_middleware = async (ctx, next) => {
  if (__ofc_fetch_url.prefix == null) {
    __ofc_fetch_url.prefix = ctx.deployment.prefix;
    __ofc_fetch_url.protocol = ctx.deployment.protocol;
  }
  await next();
};

export default __ofc_fetch_middleware;
