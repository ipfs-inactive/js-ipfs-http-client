'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    /**
     * Show blocks currently on the wantlist.
     *
     * Print out all blocks currently on the bitswap wantlist for the local peer.
     *
     * @alias bitswap.wantlist
     * @method
     * @param {function(Error, Array<string>)} [callback]
     *
     * @returns {Promise<Array<string>>|undefined}
     * @memberof IpfsApi#
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
     * @param {function(Error, Object)} [callback]
     *
     * @returns {Promise<Object>|undefined}
     * @memberof IpfsApi#
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
     * @param {string|Array<string>} key - The `base58` encoded multihashes of the blocks to unwant.
     * @param {Object} [opts={}]
     * @param {function(Error)} [callback]
     *
     * @returns {Promise<undefined>|undefined}
     * @memberof IpfsApi#
     */
    unwant: promisify((key, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'bitswap/unwant',
        args: key,
        qs: opts
      }, callback)
    })
  }
}
