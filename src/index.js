'use strict'
/* global self */

const multiaddr = require('multiaddr')
const loadCommands = require('./utils/load-commands')
const getConfig = require('./utils/default-config')
const sendRequest = require('./utils/send-request')

function ipfsClient (hostOrMultiaddr, port, opts) {
  const config = getConfig()
  if (typeof hostOrMultiaddr === 'string') {
    if (hostOrMultiaddr[0] === '/') {
      // throws if multiaddr is malformed or can't be converted to a nodeAddress
      const maddr = multiaddr(hostOrMultiaddr).nodeAddress()
      config.host = maddr.address
      config.port = maddr.port
    } else {
      config.host = hostOrMultiaddr
      config.port = port && typeof port !== 'object' ? port : config.port
    }
  }

  let lastIndex = arguments.length
  while (!opts && lastIndex-- > 0) {
    opts = arguments[lastIndex]
    if (opts) break
  }

  Object.assign(config, opts)

  // autoconfigure in browser
  if (!config.host &&
    typeof self !== 'undefined') {
    const split = self.location.host.split(':')
    config.host = split[0]
    config.port = split[1]
  }

  const requestAPI = sendRequest(config)
  const cmds = loadCommands(requestAPI, config)
  cmds.send = requestAPI
  cmds.Buffer = Buffer // Added buffer in types (this should be removed once a breaking change is release)

  return cmds
}

module.exports = ipfsClient
