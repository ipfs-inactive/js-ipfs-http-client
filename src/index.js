'use strict'

const multiaddr = require('multiaddr')
const getConfig = require('./config')
const getRequestAPI = require('./request-api')
const Wreck = require('wreck')
const ndjson = require('ndjson')

module.exports = IpfsAPI

/**
 * Create a ipfs api
 * @constructor
 * @param {string} host_or_multiaddr
 * @param {number} port
 */
function IpfsAPI (host_or_multiaddr, port) {
  const self = this
  const config = getConfig()

  if (!(self instanceof IpfsAPI)) {
    return new IpfsAPI(host_or_multiaddr, port)
  }

  try {
    const maddr = multiaddr(host_or_multiaddr).nodeAddress()
    config.host = maddr.address
    config.port = maddr.port
  } catch (e) {
    config.host = host_or_multiaddr
    config.port = port || config.port
  }

  // autoconfigure in browser
  if (!config.host &&
    typeof window !== 'undefined') {
    const split = window.location.host.split(':')
    config.host = split[0]
    config.port = split[1]
  }

  const requestAPI = getRequestAPI(config)

  /** @private */
  function command (name) {
    return (opts, cb) => {
      if (typeof (opts) === 'function') {
        cb = opts
        opts = {}
      }
      return requestAPI(name, null, opts, null, cb)
    }
  }

  /** @private */
  function argCommand (name) {
    return (arg, opts, cb) => {
      if (typeof (opts) === 'function') {
        cb = opts
        opts = {}
      }
      return requestAPI(name, arg, opts, null, cb)
    }
  }

  // -- Interface

  /** @public */
  self.send = requestAPI

  /**
   * Add a file/many files to IPFS returning the hash and name. The
   * name value will only be set if you are actually sending a file.
   *
   * @public
   * @param {} files
   * @param {object} opts
   * @param {function} cb
   */
  this.add = (files, opts, cb) => {
    if (typeof (opts) === 'function' && cb === undefined) {
      cb = opts
      opts = {}
    }

    if (typeof files === 'string' && files.startsWith('http')) {
      Wreck.request('GET', files, null, (err, res) => {
        if (err) return cb(err)

        requestAPI('add', null, opts, res, cb)
      })

      return
    }

    requestAPI('add', null, opts, files, cb)
  }

  self.cat = argCommand('cat')
  self.ls = argCommand('ls')

  self.config = {
    get: argCommand('config'),
    set (key, value, opts, cb) {
      if (typeof (opts) === 'function') {
        cb = opts
        opts = {}
      }
      return requestAPI('config', [key, value], opts, null, cb)
    },
    show (cb) {
      return requestAPI('config/show', null, null, null, true, cb)
    },
    replace (file, cb) {
      return requestAPI('config/replace', null, null, file, cb)
    }
  }

  self.update = {
    apply: command('update'),
    check: command('update/check'),
    log: command('update/log')
  }

  self.version = command('version')
  self.commands = command('commands')

  self.mount = (ipfs, ipns, cb) => {
    if (typeof ipfs === 'function') {
      cb = ipfs
      ipfs = null
    } else if (typeof ipns === 'function') {
      cb = ipns
      ipns = null
    }
    const opts = {}
    if (ipfs) opts.f = ipfs
    if (ipns) opts.n = ipns
    return requestAPI('mount', null, opts, null, cb)
  }

  self.diag = {
    net: command('diag/net'),
    sys: command('diag/sys')
  }

  self.block = {
    get: argCommand('block/get'),
    put (file, cb) {
      if (Array.isArray(file)) {
        return cb(null, new Error('block.put() only accepts 1 file'))
      }
      return requestAPI('block/put', null, null, file, cb)
    }
  }

  self.object = {
    get: argCommand('object/get'),
    put (file, encoding, cb) {
      if (typeof encoding === 'function') {
        return cb(null, new Error("Must specify an object encoding ('json' or 'protobuf')"))
      }
      return requestAPI('object/put', encoding, null, file, cb)
    },
    data: argCommand('object/data'),
    stat: argCommand('object/stat'),
    links: argCommand('object/links'),
    patch (file, opts, cb) {
      return requestAPI('object/patch', [file].concat(opts), null, null, cb)
    }
  }

  self.swarm = {
    peers: command('swarm/peers'),
    connect: argCommand('swarm/connect')
  }

  self.ping = (id, cb) => {
    return requestAPI('ping', id, { n: 1 }, null, function (err, res) {
      if (err) return cb(err, null)
      cb(null, res[1])
    })
  }

  self.id = (id, cb) => {
    if (typeof id === 'function') {
      cb = id
      id = null
    }
    return requestAPI('id', id, null, null, cb)
  }

  self.pin = {
    add (hash, opts, cb) {
      if (typeof opts === 'function') {
        cb = opts
        opts = null
      }

      requestAPI('pin/add', hash, opts, null, cb)
    },
    remove (hash, opts, cb) {
      if (typeof opts === 'function') {
        cb = opts
        opts = null
      }

      requestAPI('pin/rm', hash, opts, null, cb)
    },
    list (type, cb) {
      if (typeof type === 'function') {
        cb = type
        type = null
      }
      let opts = null
      if (type) opts = { type: type }
      return requestAPI('pin/ls', null, opts, null, cb)
    }
  }

  self.log = {
    tail (cb) {
      requestAPI('log/tail', null, {}, null, false, (err, res) => {
        if (err) return cb(err)
        cb(null, res.pipe(ndjson.parse()))
      })
    }
  }

  self.name = {
    publish: argCommand('name/publish'),
    resolve: argCommand('name/resolve')
  }

  self.Buffer = Buffer

  self.refs = argCommand('refs')
  self.refs.local = command('refs/local')

  self.dht = {
    findprovs: argCommand('dht/findprovs'),

    get (key, opts, cb) {
      if (typeof (opts) === 'function' && !cb) {
        cb = opts
        opts = null
      }

      return requestAPI('dht/get', key, opts, null, (err, res) => {
        if (err) return cb(err)
        if (!res) return cb(new Error('empty response'))
        if (res.length === 0) return cb(new Error('no value returned for key'))

        // Inconsistent return values in the browser vs node
        if (Array.isArray(res)) {
          res = res[0]
        }

        if (res.Type === 5) {
          cb(null, res.Extra)
        } else {
          cb(res)
        }
      })
    },

    put (key, value, opts, cb) {
      if (typeof (opts) === 'function' && !cb) {
        cb = opts
        opts = null
      }

      return requestAPI('dht/put', [key, value], opts, null, cb)
    }
  }
}
