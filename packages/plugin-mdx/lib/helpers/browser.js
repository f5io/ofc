import __ofc_React from 'react'
import __ofc_ReactDOM from 'react-dom'

if (process.env.NODE_ENV !== 'production') {
  const es = new EventSource(`/_ofc_sse?w=OFC_REACT_ASSET`)
  es.addEventListener('WRITE_END', message => {
    window.location.reload()
  })
}

const __ofc = App => {
  __ofc_ReactDOM.hydrate(
    __ofc_React.createElement(App, window.OFC_REACT_PROPS),
    document.getElementById('OFC_REACT_APP'),
  )
}

export default __ofc
