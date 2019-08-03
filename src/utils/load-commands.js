'use strict'

const nodeify = require('promise-nodeify')
const { collectify, pullify, streamify } = require('../lib/iterable')

function requireCommands () {
  return {
    // Files Regular (not MFS)
    add: (_, config) => {
      const add = collectify(require('../add')(config))
      return (input, options, callback) => {
        if (typeof options === 'function') {
          callback = options
          options = {}
        }
        return nodeify(add(input, options), callback)
      }
    },
    addReadableStream: (_, config) => {
      const add = require('../add')(config)
      return streamify.transform(add)
    },
    addPullStream: (_, config) => {
      const add = require('../add')(config)
      return pullify.transform(add)
    },
    // TODO: convert
    addFromFs: require('../files-regular/add-from-fs'),
    addFromURL: (_, config) => {
      const addFromURL = collectify(require('../add-from-url')(config))
      return (url, options, callback) => {
        if (typeof options === 'function') {
          callback = options
          options = {}
        }
        return nodeify(addFromURL(url, options), callback)
      }
    },
    addFromStream: (_, config) => {
      const add = collectify(require('../add')(config))
      return (input, options, callback) => {
        if (typeof options === 'function') {
          callback = options
          options = {}
        }
        return nodeify(add(input, options), callback)
      }
    },
    cat: require('../files-regular/cat'),
    catReadableStream: require('../files-regular/cat-readable-stream'),
    catPullStream: require('../files-regular/cat-pull-stream'),
    get: require('../files-regular/get'),
    getReadableStream: require('../files-regular/get-readable-stream'),
    getPullStream: require('../files-regular/get-pull-stream'),
    ls: require('../files-regular/ls'),
    lsReadableStream: require('../files-regular/ls-readable-stream'),
    lsPullStream: require('../files-regular/ls-pull-stream'),
    refs: require('../files-regular/refs'),
    refsReadableStream: require('../files-regular/refs-readable-stream'),
    refsPullStream: require('../files-regular/refs-pull-stream'),

    // Files MFS (Mutable Filesystem)
    files: require('../files-mfs'),

    // Block
    block: require('../block'),
    bitswap: require('../bitswap'),

    // Graph
    dag: require('../dag'),
    object: require('../object'),
    pin: require('../pin'),

    // Network
    bootstrap: require('../bootstrap'),
    dht: require('../dht'),
    name: require('../name'),
    ping: require('../ping'),
    pingReadableStream: require('../ping-readable-stream'),
    pingPullStream: require('../ping-pull-stream'),
    swarm: require('../swarm'),
    pubsub: require('../pubsub'),
    dns: require('../dns'),

    // Miscellaneous
    commands: require('../commands'),
    config: require('../config'),
    diag: require('../diag'),
    id: require('../id'),
    key: require('../key'),
    log: require('../log'),
    mount: require('../mount'),
    repo: require('../repo'),
    stop: require('../stop'),
    shutdown: require('../stop'),
    stats: require('../stats'),
    update: require('../update'),
    version: require('../version'),
    resolve: require('../resolve'),
    // ipfs-http-client instance
    getEndpointConfig: (send, config) => require('../get-endpoint-config')(config)
  }
}

function loadCommands (send, config) {
  const files = requireCommands()
  const cmds = {}

  Object.keys(files).forEach((file) => {
    cmds[file] = files[file](send, config)
  })

  return cmds
}

module.exports = loadCommands
