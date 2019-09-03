'use strict'

const nodeify = require('promise-nodeify')
const moduleConfig = require('../utils/module-config')
const { collectify, pullify, streamify } = require('../lib/converters')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
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
    addFromFs: (_, config) => {
      const addFromFs = collectify(require('../add-from-fs')(config))
      return (path, options, callback) => {
        if (typeof options === 'function') {
          callback = options
          options = {}
        }
        return nodeify(addFromFs(path, options), callback)
      }
    },
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
    _addAsyncIterator: (_, config) => require('../add')(config),
    cat: require('../files-regular/cat')(send),
    catReadableStream: require('../files-regular/cat-readable-stream')(send),
    catPullStream: require('../files-regular/cat-pull-stream')(send),
    get: require('../files-regular/get')(send),
    getReadableStream: require('../files-regular/get-readable-stream')(send),
    getPullStream: require('../files-regular/get-pull-stream')(send),
    ls: require('../files-regular/ls')(send),
    lsReadableStream: require('../files-regular/ls-readable-stream')(send),
    lsPullStream: require('../files-regular/ls-pull-stream')(send),
    refs: require('../files-regular/refs')(send),
    refsReadableStream: require('../files-regular/refs-readable-stream')(send),
    refsPullStream: require('../files-regular/refs-pull-stream')(send)
  }
}
