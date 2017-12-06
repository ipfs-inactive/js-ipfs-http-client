'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../utils/stream-to-value')

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    
    send.andTransform({
      path: 'stats/bw',
      qs: opts
    }, streamToValue, callback)
  })
}
