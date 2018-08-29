'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')

const transform = function (res, callback) {
  callback(null, res.Keys.map(str => new CID(str)))
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

    opts = opts || {}
    const qs = {}

    if (peerId) {
      try {
        qs.peer = new CID(peerId).toBaseEncodedString()
      } catch (err) {
        return callback(err)
      }
    }

    send.andTransform({ path: 'bitswap/wantlist', qs }, transform, callback)
  })
}
