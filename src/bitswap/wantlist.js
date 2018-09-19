'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')

const transform = function (res, callback) {
  callback(null, res.Keys.map(k => k['/']))
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

    if (opts.cidBase) {
      qs['cid-base'] = opts.cidBase
    }

    send.andTransform({ path: 'bitswap/wantlist', qs }, transform, callback)
  })
}
