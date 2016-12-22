'use strict'

const multiaddr = require('multiaddr')

const getConfig = require('./default-config')
const getRequestAPI = require('./request-api')

/**
 * Create a new IpfsApi.
 *
 * > `js-ipfs-api` follows the spec defined by
 * > [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core), which
 * > concerns the interface to expect from IPFS implementations. This interface is a
 * > currently active endeavor. You can use it today to consult the methods available.
 *
 * @constructor IpfsApi
 * @param {string|Multiaddr} [hostOrMultiaddr='localhost'] - The host to connect to.
 * @param {number|string} [port=5001] - The port to use to connect to the api.
 * @param {Object} [opts={}]
 * @param {string} [host]
 * @param {number|string} [opts.port]
 * @param {string} [opts.protocol='http'] - Can be either `http` or `https`.
 * @returns {IpfsApi}
 *
 * @example
 * const ipfsAPI = require('ipfs-api')
 *
 * // connect to ipfs daemon API server
 * const ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'})
 * // leaving out the arguments will default to these values
 *
 * // or connect with multiaddr
 * const ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')
 *
 * // or using options
 * const ipfs = ipfsAPI({host: 'localhost', port: '5001', procotol: 'http'})
 */
function IpfsApi (hostOrMultiaddr, port, opts) {
  if (!(this instanceof IpfsApi)) {
    return new IpfsApi(hostOrMultiaddr, port, opts)
  }

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

  /**
   * Send a request
   *
   * @private
   */
  this.send = requestAPI

  /**
   * Expose `buffer` module.
   *
   */
  this.Buffer = Buffer

  // add and createAddStream alias
  this.add = require('./api/add')(this.send)
  this.cat = require('./api/cat')(this.send)
  this.createAddStream = require('./api/create-add-stream')(this.send)
  this.bitswap = require('./api/bitswap')(this.send)
  this.block = require('./api/block')(this.send)
  this.bootstrap = require('./api/bootstrap')(this.send)
  this.commands = require('./api/commands')(this.send)
  this.config = require('./api/config')(this.send)
  this.dht = require('./api/dht')(this.send)
  this.diag = require('./api/diag')(this.send)
  this.id = require('./api/id')(this.send)
  this.get = require('./api/get')(this.send)
  this.log = require('./api/log')(this.send)
  this.ls = require('./api/ls')(this.send)
  this.mount = require('./api/mount')(this.send)
  this.name = require('./api/name')(this.send)
  this.object = require('./api/object')(this.send)
  this.pin = require('./api/pin')(this.send)
  this.ping = require('./api/ping')(this.send)
  this.refs = require('./api/refs')(this.send)
  this.repo = require('./api/repo')(this.send)
  this.swarm = require('./api/swarm')(this.send)
  this.update = require('./api/update')(this.send)
  this.version = require('./api/version')(this.send)

  // TODO: crowding the 'files' namespace temporarily for
  // interface-ipfs-core compatibility, until
  // 'files vs mfs' naming decision is resolved.
  this.files = require('./api/files')(this.send)
  this.files.add = require('./api/add')(this.send)
  this.files.createAddStream = require('./api/create-add-stream.js')(this.send)
  this.files.get = require('./api/get')(this.send)
  this.files.cat = require('./api/cat')(this.send)

  this.util = {
    addFromFs: require('./api/util/fs-add')(this.send),
    addFromStream: require('./api/add')(this.send),
    addFromURL: require('./api/util/url-add')(this.send)
  }
}

module.exports = exports = IpfsApi
