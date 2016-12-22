'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    /**
     * @alias diag.net
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    net: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }

      send({
        path: 'diag/net',
        qs: opts
      }, callback)
    }),

    /**
     * @alias diag.sys
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    sys: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }

      send({
        path: 'diag/sys',
        qs: opts
      }, callback)
    }),

    /**
     * @alias diag.cmds
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    cmds: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }

      send({
        path: 'diag/cmds',
        qs: opts
      }, callback)
    })
  }
}
