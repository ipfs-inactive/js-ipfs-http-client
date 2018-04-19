'use strict'

const ipRegex = require('ip-regex')
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
      config.host = hostOrMultiaddr
      const addrParts = hostOrMultiaddr.split(':')
      if (addrParts.length === 1 && ipRegex.v4({ exact: true }).test(addrParts[0]) &&
          (!port || typeof port === 'object')) {
        // IPv4 Host with no port specified
        config.port = undefined
      } else if (addrParts.length === 2 && ipRegex.v4({ exact: true }).test(addrParts[0]) &&
          (!port || typeof port === 'object')) {
        // IPv4 Host with port specified
        config.host = addrParts[0]
        config.port = addrParts[1]
      } else {
        config.port = port
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
  const cmds = loadCommands(requestAPI, config)
  cmds.send = requestAPI
  cmds.Buffer = Buffer // Added buffer in types (this should be removed once a breaking change is release)

  return cmds
}

exports = module.exports = IpfsAPI
