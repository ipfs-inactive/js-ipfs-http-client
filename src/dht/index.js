'use strict'

const callbackify = require('callbackify')
const errCode = require('err-code')
const { collectify } = require('../lib/converters')
const moduleConfig = require('../utils/module-config')

module.exports = (arg, config) => {
  const send = moduleConfig(arg)
  const get = require('./get')(config)
  const findProvs = require('./find-provs')(config)
  const findPeer = require('./find-peer')(config)

  return {
    get: callbackify.variadic(async (key, options) => {
      for await (const value of get(key, options)) {
        return value
      }
      throw errCode(new Error('value not found'), 'ERR_TYPE_5_NOT_FOUND')
    }),
    put: require('./put')(send),
    findProvs: callbackify.variadic(collectify(findProvs)),
    findPeer: callbackify.variadic(async (peerId, options) => {
      for await (const peerInfo of findPeer(peerId, options)) {
        return peerInfo
      }
      throw errCode(new Error('final peer not found'), 'ERR_TYPE_2_NOT_FOUND')
    }),
    provide: require('./provide')(send),
    // find closest peerId to given peerId
    query: require('./query')(send)
  }
}
