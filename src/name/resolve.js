'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const multihash = require('multihashes')

const transform = function (res, callback) {
  callback(null, res.Path)
}

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    // normalize PeerIDs to Base58btc, so it works with go-ipfs <=0.4.22
    if (typeof (args) === 'string') {
      try {
        const path = args.split('/')
        if (path.length > 2) {
          path[2] = multihash.toB58String(new CID(path[2]).multihash)
          args = path.join('/')
        }
      } catch (err) {
        // noop
      }
    }

    send.andTransform({
      path: 'name/resolve',
      args: args,
      qs: opts
    }, transform, callback)
  })
}
