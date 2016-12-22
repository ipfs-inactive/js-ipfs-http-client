'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    /**
     * @alias update.apply
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    apply: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'update',
        qs: opts
      }, callback)
    }),

    /**
     * @alias update.check
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    check: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'update/check',
        qs: opts
      }, callback)
    }),

    /**
     * @alias update.log
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    log: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'update/log',
        qs: opts
      }, callback)
    })
  }
}
