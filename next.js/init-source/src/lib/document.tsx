import React, { Component, PropTypes } from 'react'
import htmlescape from 'htmlescape'

export default class Document extends Component {
  [key: string]: any;
  static childContextTypes = {
    _documentProps: PropTypes.any
  }

  getChildContext() {
    return {
      _documentProps: this.props
    }
  }

  render() {
    return <html>
      <Head />
      <body>
        <Main />
        <DevTools />
        <NextScript />
      </body>
    </html>
  }
}

export function Head(props, context) {
  const { head } = context._documentProps
  const h = (head || [])
    .map((h, i) => React.cloneElement(h, { key: '_next' + i }))
  return <head>{h}</head>
}

Head.contextTypes = { _documentProps: PropTypes.any }

export function Main(props, context) {
  const { html, data } = context._documentProps;
  return <div>
    <div id='__next' dangerouslySetInnerHTML={{ __html: html }} />
    <script dangerouslySetInnerHTML={{ __html: '__NEXT_DATA__ = ' + htmlescape(data) }}></script>
  </div>
}

Main.contextTypes = { _documentProps: PropTypes.any }

export function DevTools(props, context) {
  const { hotReload } = context._documentProps
  return hotReload ? <div id='__next-hot-code-reloading-indicator' /> : null
}

DevTools.contextTypes = { _documentProps: PropTypes.any }

export function NextScript(props, context) {
  const { hotReload } = context._documentProps;
  const src = !hotReload ? '/_next/next.bundle.js' : '/_next/next-dev.bundle.js'
  return <script type='text/javascript' src={src} />
}

NextScript.contextTypes = { _documentProps: PropTypes.any }
