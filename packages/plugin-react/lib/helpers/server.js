const __ofc = (app, getInitialProps) => async (ctx) => {
  const App = React.createFactory(app);
  const props = getInitialProps
    ? (await getInitialProps(ctx))
    : {};

  ctx.type = '.html';
  ctx.body = `
    <!doctype html>
    <html>
      <head>
        <title>React App</title>
      </head>
      <body>
        <div id="OFC_REACT_APP">
          ${ReactDOMServer.renderToString(App(props))}
        </div>
        <script>
          window.OFC_REACT_PROPS = ${JSON.stringify(props)}
        </script>
        <script src="/assets/OFC_REACT_ASSET" type="module"></script>
      </body>
    </html>
  `;

};
