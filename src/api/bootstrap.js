'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    /**
     * Add peers to the bootstrap list.
     * @alias bootstrap.add
     * @method
     * @param {string|Array<string>} peers - A list of peers to add to the bootstrap list (in the format `'<multiaddr>/<peerID>'`)
     * @param {Object} [opts={}]
     * @param {function(Error)} [callback]
     * @returns {Promise<undefined>|undefined}
     * @memberof Api#
     */
    add: promisify((peers, opts, callback) => {
      if (typeof opts === 'function' &&
          !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' &&
          typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      if (peers && typeof peers === 'object') {
        opts = peers
        peers = undefined
      }

      send({
        path: 'bootstrap/add',
        args: peers,
        qs: opts
      }, callback)
    }),

    /**
     * Remove peers from the bootstrap list.
     *
     * @alias bootstrap.rm
     * @method
     * @param {string|Array<string>} peers - The peers to remove from the bootstrap list
     * @param {Object} [opts={}]
     * @param {function(Error)} [callback]
     * @returns {Promise<undefined>|undefined}
     * @memberof Api#
     */
    rm: promisify((peers, opts, callback) => {
      if (typeof opts === 'function' &&
          !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' &&
          typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      if (peers && typeof peers === 'object') {
        opts = peers
        peers = undefined
      }

      send({
        path: 'bootstrap/rm',
        args: peers,
        qs: opts
      }, callback)
    }),

    /**
     * Show peers in the bootstrap list.
     *
     * @alias bootstrap.list
     * @method
     * @param {Object} [opts={}]
     * @param {function(Error, Array<string>)} [callback]
     * @returns {Promise<Array<string>|undefined}
     * @memberof Api#
     */
    list: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'bootstrap/list',
        qs: opts
      }, callback)
    })
  }
}
