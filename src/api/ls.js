'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  /**
   * @alias ls
   * @method
   * @returns {Promise|undefined}
   * @memberof Api#
   */
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    send({
      path: 'ls',
      args: args,
      qs: opts
    }, callback)
  })
}
