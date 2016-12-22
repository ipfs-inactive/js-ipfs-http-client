'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    /**
     * @alias repo.gc
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    gc: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'repo/gc',
        qs: opts
      }, callback)
    }),

    /**
     * @alias repo.stat
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    stat: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'repo/stat',
        qs: opts
      }, callback)
    })
  }
}
