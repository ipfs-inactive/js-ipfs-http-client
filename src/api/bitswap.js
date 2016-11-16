'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    /**
     * Show blocks currently on the wantlist.
     *
     * @alias bitswap.wantlist
     * @method
     * @param {Function} [callback]
     *
     * @returns {Promise}
     * @memberof Api#
     */
    wantlist: promisify((callback) => {
      send({
        path: 'bitswap/wantlist'
      }, callback)
    }),
    /**
     * Show some diagnostic information on the bitswap agent.
     *
     * @alias bitswap.stat
     * @method
     * @param {Function} [callback]
     *
     * @returns {Promise}
     * @memberof Api#
     */
    stat: promisify((callback) => {
      send({
        path: 'bitswap/stat'
      }, callback)
    }),
    /**
     * Remove a given block from your wantlist.
     *
     * @alias bitswap.unwant
     * @method
     * @param {*} args
     * @param {Object} opts
     * @param {Function} [callback]
     *
     * @returns {Promise}
     * @memberof Api#
     */
    unwant: promisify((args, opts, callback) => {
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
}
