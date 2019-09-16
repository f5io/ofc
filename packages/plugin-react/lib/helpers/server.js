import __ofc_React from 'react';
import __ofc_ReactDOMServer from 'react-dom/server';
import { ServerStyleSheet as __ofc_ServerStyleSheet } from 'styled-components';

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

const __ofc = (app, getInitialProps) => async (ctx) => {
  const App = __ofc_React.createFactory(app);
  const props = getInitialProps
    ? (await getInitialProps(ctx))
    : {};

  const sheet = new __ofc_ServerStyleSheet();
  const html = __ofc_ReactDOMServer.renderToString(
    sheet.collectStyles(App(props))
  );

  ctx.type = '.html';
  ctx.body = `
    <!doctype html>
    <html>
      <head>
        <title>React App</title>
        ${sheet.getStyleTags()}
      </head>
      <body>
        <div id="OFC_REACT_APP">${html}</div>
        <script>
          window.OFC_REACT_PROPS = ${JSON.stringify(props)}
        </script>
        <script src="/assets/OFC_REACT_ASSET" type="module"></script>
      </body>
    </html>
  `;

};

export default __ofc;
