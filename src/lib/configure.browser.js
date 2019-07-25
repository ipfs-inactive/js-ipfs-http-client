'use strict'
/* eslint-env browser */

const { toUri } = require('./multiaddr')

// Set default configuration and call create function with them
module.exports = create => config => {
  config = config || {}

  if (typeof config === 'string') {
    config = { apiAddr: config }
  } else if (config.constructor && config.constructor.isMultiaddr) {
    config = { apiAddr: config }
  } else {
    config = { ...config }
  }

  config.fetch = config.fetch || require('./fetch').fetch
  config.apiAddr = (config.apiAddr || getDefaultApiAddr(config)).toString()
  config.apiAddr = config.apiAddr.startsWith('/')
    ? toUri(config.apiAddr)
    : config.apiAddr
  config.apiPath = config.apiPath || config['api-path'] || '/api/v0'

  if (config.apiPath.endsWith('/')) {
    config.apiPath = config.apiPath.slice(0, -1)
  }

  config.headers = new Headers(config.headers)

  return create(config)
}

function getDefaultApiAddr ({ protocol, host, port }) {
  if (!protocol) {
    protocol = location.protocol.startsWith('http')
      ? location.protocol.split(':')[0]
      : 'http'
  }

  host = host || location.hostname
  port = port || location.port

  return `${protocol}://${host}${port ? ':' + port : ''}`
}
