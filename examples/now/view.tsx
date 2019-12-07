import React, { useState, useEffect } from 'react';
import { Context } from 'koa';
import styled from 'styled-components';

import { Div } from './src/components/div.jsx';

const Button = styled.button`
  color: red;
  background: black;
`;

type Props = {
  hello: string;
};

const render = (props: Props) => {
  const [state, setState] = useState(1000000);
  useEffect(() => {
    import('./src/utils/test')
      .then(m => m.one())
      .then(console.log.bind(console));
  });
  return (
    <Div>
      <Button onClick={() => setState(x => x + 1)}>
        Hello {props.hello} {state}!
      </Button>
    </Div>
  );
};

export const getInitialProps = async (_: Context): Promise<Props> => {
  const hello = await fetch('/api/hello/there/Barry').then(r => r.text());
  return { hello };
};

export default render;
