import __ofc_node_fetch from 'node-fetch';
import url from 'url';
import { join } from 'path';

const __ofc_fetch = (u, ...rest) => {
  const parsed = url.parse(u);
  if (!parsed.protocol && !parsed.hostname) {
    return __ofc_node_fetch(
      'http://' + join('0.0.0.0:OFC_PORT', u), 
      ...rest,
    );
  }
  return __ofc_node_fetch(u, ...rest);
};
