import __ofc_React from 'react';
import __ofc_ReactDOMServer from 'react-dom/server';
import { ServerStyleSheet as __ofc_ServerStyleSheet } from 'styled-components';

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
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${sheet.getStyleTags()}
      </head>
      <body>
        <div id="OFC_REACT_APP">${html}</div>
        <script>
          window.OFC_REACT_PROPS = ${JSON.stringify(props)}
        </script>
        <script src="/OFC_REACT_ASSET" type="module"></script>
      </body>
    </html>
  `;

};

export default __ofc;
