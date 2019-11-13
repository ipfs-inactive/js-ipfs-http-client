'use strict'

const callbackify = require('callbackify')
const moduleConfig = require('../utils/module-config')

module.exports = (arg, config) => {
  const send = moduleConfig(arg)

  return {
    get: require('./get')(send),
    put: require('./put')(send),
    findProvs: require('./find-provs')(send),
    findPeer: callbackify.variadic(require('./find-peer')(config)),
    provide: require('./provide')(send),
    // find closest peerId to given peerId
    query: require('./query')(send)
  }
}
