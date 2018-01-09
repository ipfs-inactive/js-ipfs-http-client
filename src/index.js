'use strict'

const multiaddr = require('multiaddr')
const loadCommands = require('./utils/load-commands')
const getConfig = require('./utils/default-config')
const sendRequest = require('./utils/send-request')

function IpfsAPI (hostOrMultiaddr, port, opts) {
  const config = getConfig()

  try {
    const maddr = multiaddr(hostOrMultiaddr).nodeAddress()
    config.host = maddr.address
    config.port = maddr.port
  } catch (e) {
    if (typeof hostOrMultiaddr === 'string') {
      if (hostOrMultiaddr.match(/^\/\/.*:\d+$/)) {
        const parts = hostOrMultiaddr.split(':')
        if (parts.length === 2) {
          config.host = parts[0].substr(2, parts[0].length - 1)
          config.port = parts[1]
        }
      } else {
        config.host = hostOrMultiaddr
        config.port = port && typeof port !== 'object' ? port : config.port
      }
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
  const cmds = loadCommands(requestAPI)
  cmds.send = requestAPI
  cmds.Buffer = Buffer

  return cmds
}

exports = module.exports = IpfsAPI
