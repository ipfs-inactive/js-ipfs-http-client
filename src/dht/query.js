'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../utils/stream-to-value')

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

    send({
      path: 'dht/query',
      args: peerId,
      qs: opts
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
