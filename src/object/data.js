'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../utils/stream-to-value')
const CID = require('cids')
const LRU = require('lru-cache')
const lruOptions = {
  max: 128
}

const cache = LRU(lruOptions)

module.exports = (send) => {
  return promisify((hash, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    if (!options) {
      options = {}
    }

    let cid, b58Hash

    try {
      cid = new CID(hash)
      b58Hash = cid.toBaseEncodedString()
    } catch (err) {
      return callback(err)
    }

    const node = cache.get(b58Hash)

    if (node) {
      return callback(null, node.data)
    }

    send({
      path: 'object/data',
      args: b58Hash
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      if (typeof result.pipe === 'function') {
        streamToValue(result, callback)
      } else {
        callback(null, result)
      }
    })
  })
}
