'use strict'

const { Headers } = require('node-fetch')
const { toUri } = require('./multiaddr')
const pkg = require('../../package.json')

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

  if (config.protocol || config.host || config.port) {
    const port = config.port ? `:${config.port}` : ''
    config.apiAddr = `${config.protocol || 'http'}://${config.host || 'localhost'}${port}`
  }

  config.apiAddr = (config.apiAddr || 'http://localhost:5001').toString()
  config.apiAddr = config.apiAddr.startsWith('/')
    ? toUri(config.apiAddr)
    : config.apiAddr
  config.apiPath = config.apiPath || config['api-path'] || '/api/v0'

  if (config.apiPath.endsWith('/')) {
    config.apiPath = config.apiPath.slice(0, -1)
  }

  config.headers = new Headers(config.headers)

  if (!config.headers.has('User-Agent')) {
    config.headers.append('User-Agent', `${pkg.name}/${pkg.version}`)
  }

  return create(config)
}
