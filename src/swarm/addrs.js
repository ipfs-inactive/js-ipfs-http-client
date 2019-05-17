'use strict'

const promisify = require('promisify-es6')
const PeerInfo = require('peer-info-lite')
const PeerId = require('peer-id-lite')
const multiaddr = require('multiaddr')

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    send({
      path: 'swarm/addrs',
      qs: opts
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      const peers = Object.keys(result.Addrs).map((id) => {
        const peerInfo = new PeerInfo(PeerId.createFromB58String(id))
        result.Addrs[id].forEach((addr) => {
          peerInfo.multiaddrs.add(multiaddr(addr))
        })
        return peerInfo
      })

      callback(null, peers)
    })
  })
}
