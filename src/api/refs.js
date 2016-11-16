'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../stream-to-value')

module.exports = (send) => {
  /**
   * @alias refs
   * @method
   * @returns {Promise|undefined}
   * @memberof Api#
   */
  const refs = promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    const request = {
      path: 'refs',
      args: args,
      qs: opts
    }

    send.andTransform(request, streamToValue, callback)
  })

  /**
   * @alias refs.local
   * @method
   * @returns {Promise|undefined}
   * @memberof Api#
   */
  refs.local = promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    const request = {
      path: 'refs',
      qs: opts
    }

    send.andTransform(request, streamToValue, callback)
  })

  return refs
}
