'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')

module.exports = (send) => {
  return promisify((cid, opts, callback) => {
    try {
      cid = new CID(cid).toBaseEncodedString()
    } catch (err) {
      return callback(err)
    }

    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    opts = opts || {}
    const qs = {}

    if (opts.cidBase) {
      qs['cid-base'] = opts.cidBase
    }

    const request = {
      path: 'block/stat',
      args: cid,
      qs: opts
    }

    // Transform the response from { Key, Size } objects to { key, size } objects
    const transform = (stats, callback) => {
      callback(null, {
        key: stats.Key,
        size: stats.Size
      })
    }

    send.andTransform(request, transform, callback)
  })
}
