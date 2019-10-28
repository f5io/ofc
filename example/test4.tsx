import React, { useState, useEffect } from 'react'
import { Context } from 'koa'
import styled from 'styled-components'

import { Div } from './utils/test.jsx'

const Button = styled.button`
  color: red;
  background: black;
`

type Props = {
  hello: string
}

const render = (props: Props) => {
  const [state, setState] = useState(1000000)
  useEffect(() => {
    import('./file2')
      .then(m => m.one())
      .then(console.log.bind(console))
  })
  return (
    <Div>
      <Button onClick={() => setState(x => x + 1)}>
        Hello {props.hello} {state}!
      </Button>
    </Div>
  )
}

export const getInitialProps = async (_: Context): Promise<Props> => {
  return {
    hello: 'ofc! ofc! ofc! ofc! Typescript Boom Beam eekyie!',
  }
}

export default render
