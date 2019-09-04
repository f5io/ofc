import React from 'react';
import ReactDOM from 'react-dom';

export default (App) => {
  ReactDOM.hydrate(
    React.createElement(App, window.OFC_REACT_PROPS),
    document.getElementById('OFC_REACT_APP'),
  );
};
