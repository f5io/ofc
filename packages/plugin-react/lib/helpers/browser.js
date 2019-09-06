if (process.env.NODE_ENV !== 'production') {
  const es = new EventSource(`/_ofc_sse?w=OFC_REACT_ASSET`);
  es.addEventListener('WRITE_END', message => {
    window.location.reload();
  });
}

const __ofc = (App) => {
  ReactDOM.hydrate(
    React.createElement(App, window.OFC_REACT_PROPS),
    document.getElementById('OFC_REACT_APP'),
  );
};
