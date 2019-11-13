'use strict'

const callbackify = require('callbackify')
const errCode = require('err-code')
const moduleConfig = require('../utils/module-config')

module.exports = (arg, config) => {
  const send = moduleConfig(arg)
  const findProvs = require('./find-provs')(config)
  const findPeer = require('./find-peer')(config)

  return {
    get: require('./get')(send),
    put: require('./put')(send),
    findProvs: callbackify.variadic(async (cid, options) => {
      const providers = []
      for await (const message of findProvs(cid, options)) {
        // 4 = Provider
        // https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L20
        if (message.type === 4) {
          providers.push(...message.responses)
        }
      }
      return providers
    }),
    findPeer: callbackify.variadic(async (peerId, options) => {
      for await (const message of findPeer(peerId, options)) {
        // 2 = FinalPeer
        // https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L18
        if (message.type === 2) {
          return message.responses[0]
        }
      }
      throw errCode(new Error('final peer not found'), 'ERR_TYPE_2_NOT_FOUND')
    }),
    provide: require('./provide')(send),
    // find closest peerId to given peerId
    query: require('./query')(send)
  }
}
