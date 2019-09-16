import { one } from './file';
import React, { useState } from 'react';

const render = (props) => {
  const [ state, setState ] = useState(1000);
  return (
    <button onClick={() => setState(s => s + 1)}>
      Hello {props.hello} {state}!
    </button>
  );
};

export const getInitialProps = async (ctx) => {
  const f2 = await import('./file2');
  const res = await fetch('/test1').then(res => res.text());
  console.log(res);
  return {
    hello: 'and again yes ofc!',
    goodbye: await one(),
    again: await f2.one(),
  };
};

export default render;
