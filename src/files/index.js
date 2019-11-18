'use strict'

const callbackify = require('callbackify')
const { collectify, streamify, pullify } = require('../lib/converters')
const moduleConfig = require('../utils/module-config')

module.exports = (arg, config) => {
  const send = moduleConfig(arg)
  const ls = require('./ls')(config)

  return {
    cp: callbackify.variadic(require('./cp')(config)),
    mkdir: callbackify.variadic(require('./mkdir')(config)),
    flush: callbackify.variadic(require('./flush')(config)),
    stat: require('./stat')(send),
    rm: require('./rm')(send),
    ls: callbackify.variadic(collectify(ls)),
    lsReadableStream: streamify.readable(ls),
    lsPullStream: pullify.source(ls),
    read: require('./read')(send),
    readReadableStream: require('./read-readable-stream')(send),
    readPullStream: require('./read-pull-stream')(send),
    write: callbackify.variadic(require('./write')(config)),
    mv: require('./mv')(send)
  }
}
