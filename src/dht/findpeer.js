'use strict'

const promisify = require('promisify-es6')
const streamToValueWithTransformer = require('../utils/stream-to-value-with-transformer')

const multiaddr = require('multiaddr')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')

module.exports = (send) => {
  return promisify((peerId, opts, callback) => {
    if (typeof opts === 'function' && !callback) {
      callback = opts
      opts = {}
    }

    // opts is the real callback --
    // 'callback' is being injected by promisify
    if (typeof opts === 'function' && typeof callback === 'function') {
      callback = opts
      opts = {}
    }

    const handleResult = (res, callback) => {
      // Inconsistent return values in the browser
      if (Array.isArray(res)) {
        res = res.find(r => r.Type === 2)
      }

      // Type 2 keys
      // 2 = FinalPeer
      // https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L18
      if (!res || res.Type !== 2) {
        return callback()
      }

      const responseReceived = res.Responses[0]
      const peerInfo = new PeerInfo(PeerId.createFromB58String(responseReceived.ID))

      responseReceived.Addrs.forEach((addr) => {
        const ma = multiaddr(addr)

        peerInfo.multiaddrs.add(ma)
      })

      callback(null, peerInfo)
    }

    send({
      path: 'dht/findpeer',
      args: peerId.toString(),
      qs: opts
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      streamToValueWithTransformer(result, handleResult, callback)
    })
  })
}
