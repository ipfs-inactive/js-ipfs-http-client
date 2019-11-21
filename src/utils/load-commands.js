'use strict'

const nodeify = require('promise-nodeify')
const callbackify = require('callbackify')
const all = require('async-iterator-all')
const { concatify, collectify, pullify, streamify } = require('../lib/converters')
const toPullStream = require('async-iterator-to-pull-stream')
const pull = require('pull-stream/pull')
const map = require('pull-stream/throughs/map')
const toStream = require('it-to-stream')
const BufferList = require('bl/BufferList')

function requireCommands (send, config) {
  const add = require('../add')(config)
  const addFromFs = require('../add-from-fs')(config)
  const addFromURL = require('../add-from-url')(config)
  const cat = require('../cat')(config)
  const get = require('../get')(config)
  const ls = require('../ls')(config)
  const refs = require('../refs')(config)

  const cmds = {
    add: (input, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(add)(input, options), callback)
    },
    addReadableStream: streamify.transform(add),
    addPullStream: pullify.transform(add),
    addFromFs: (path, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(addFromFs)(path, options), callback)
    },
    addFromURL: (url, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(addFromURL)(url, options), callback)
    },
    addFromStream: (input, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(add)(input, options), callback)
    },
    _addAsyncIterator: add,
    cat: callbackify.variadic((path, options) => concatify(cat)(path, options)),
    catReadableStream: streamify.readable(cat),
    catPullStream: pullify.source(cat),
    _catAsyncIterator: cat,
    commands: callbackify.variadic(require('../commands')(config)),
    dns: callbackify.variadic(require('../dns')(config)),
    get: callbackify.variadic(async (path, options) => {
      const output = []

      for await (const entry of get(path, options)) {
        if (entry.content) {
          entry.content = new BufferList(await all(entry.content)).slice()
        }

        output.push(entry)
      }

      return output
    }),
    getReadableStream: streamify.readable((path, options) => (async function * () {
      for await (const file of get(path, options)) {
        if (file.content) {
          const { content } = file
          file.content = toStream((async function * () {
            for await (const chunk of content) {
              yield chunk.slice() // Convert bl to Buffer
            }
          })())
        }

        yield file
      }
    })()),
    getPullStream: (path, options) => {
      return pull(
        toPullStream(get(path, options)),
        map(file => {
          if (file.content) {
            file.content = pull(
              toPullStream(file.content),
              map(chunk => chunk.slice()) // Convert bl to Buffer
            )
          }

          return file
        })
      )
    },
    _getAsyncIterator: get,
    id: callbackify.variadic(require('../id')(config)),
    ls: callbackify.variadic((path, options) => collectify(ls)(path, options)),
    lsReadableStream: streamify.readable(ls),
    lsPullStream: pullify.source(ls),
    _lsAsyncIterator: ls,
    mount: callbackify.variadic(require('../mount')(config)),
    refs: callbackify.variadic((path, options) => collectify(refs)(path, options)),
    refsReadableStream: streamify.readable(refs),
    refsPullStream: pullify.source(refs),
    _refsAsyncIterator: refs,
    resolve: callbackify.variadic(require('../resolve')(config)),
    stop: callbackify.variadic(require('../stop')(config)),
    shutdown: callbackify.variadic(require('../stop')(config)),
    version: callbackify.variadic(require('../version')(config)),
    getEndpointConfig: require('../get-endpoint-config')(config),
    bitswap: require('../bitswap')(config),
    block: require('../block')(config),
    bootstrap: require('../bootstrap')(config),
    config: require('../config')(config),
    dag: require('../dag')(config),
    dht: require('../dht')(config),
    diag: require('../diag')(config)
  }

  Object.assign(cmds.refs, {
    local: callbackify.variadic(options => collectify(refs.local)(options)),
    localReadableStream: streamify.readable(refs.local),
    localPullStream: pullify.source(refs.local),
    _localAsyncIterator: refs.local
  })

  const subCmds = {
    // Files MFS (Mutable Filesystem)
    files: require('../files'),

    // Graph
    object: require('../object'),
    pin: require('../pin'),

    // Network
    name: require('../name'),
    ping: require('../ping'),
    pingReadableStream: require('../ping-readable-stream'),
    pingPullStream: require('../ping-pull-stream'),
    swarm: require('../swarm'),
    pubsub: require('../pubsub'),

    // Miscellaneous
    key: require('../key'),
    log: require('../log'),
    repo: require('../repo'),
    stats: require('../stats'),
    update: require('../update')
  }

  Object.keys(subCmds).forEach((file) => {
    cmds[file] = subCmds[file](send, config)
  })

  return cmds
}

module.exports = requireCommands
