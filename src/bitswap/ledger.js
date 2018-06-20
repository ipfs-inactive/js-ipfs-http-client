'use strict'

const promisify = require('promisify-es6')
const PeerId = require('peer-id')
const Big = require('big.js')

const transform = function (res, callback) {
  if (res.length === 0) {
    return callback(null, null)
  }
  callback(null, {
    Peer: res.Peer,
    Value: new Big(res.Value),
    Sent: new Big(res.Sent),
    Recv: new Big(res.Recv),
    Exchanged: new Big(res.Exchanged)
  })
}

module.exports = (send) => {
  return promisify((peerId, opts, callback) => {
    if (typeof (peerId) === 'function') {
      callback = peerId
      opts = {}
      peerId = null
    } else if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    if (peerId) {
      try {
        peerId = PeerId.createFromB58String(peerId)
      } catch (err) {
        return callback(err)
      }
    }

    send.andTransform({
      path: 'bitswap/ledger',
      args: peerId.toB58String(),
      qs: opts
    }, transform, callback)
  })
}
