'use strict'

const multiaddr = require('multiaddr')
const loadCommands = require('./load-commands')
const getConfig = require('./default-config')
const getRequestAPI = require('./request-api')

function IpfsAPI (hostOrMultiaddr, port, opts) {
  const config = getConfig()

  try {
    const maddr = multiaddr(hostOrMultiaddr).nodeAddress()
    config.host = maddr.address
    config.port = maddr.port
  } catch (e) {
    if (typeof hostOrMultiaddr === 'string') {
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
    typeof window !== 'undefined') {
    const split = window.location.host.split(':')
    config.host = split[0]
    config.port = split[1]
  }

  const requestAPI = getRequestAPI(config)
  const cmds = loadCommands(requestAPI)
  cmds.send = requestAPI
  cmds.Buffer = Buffer

  cmds.version(function (err, res) {
    if (err) console.log(err)
    var dotSplit = res.version.split('.')
    if (dotSplit[0] === 0) {
      if (dotSplit[1] < 4) {
        throw new DaemonVersionError(res)
      }
    }
  })

  return cmds
}

function DaemonVersionError (daemonVersion) {
  this.daemonVersion = daemonVersion
  this.expectedMinVersion = '0.4.4'
  this.message = 'The running daemon is version ' + daemonVersion.version + ' and should be at least ' + this.expectedMinVersion
  this.toString = function () {
    return this.message
  }
}

exports = module.exports = IpfsAPI
