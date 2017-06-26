'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    send({
      path: 'bitswap/unwant',
      args: args,
      qs: opts
    }, callback)
  })
}
