'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    /**
     * @alias name.publish
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    publish: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'name/publish',
        args: args,
        qs: opts
      }, callback)
    }),

    /**
     * @alias name.resolve
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    resolve: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'name/resolve',
        args: args,
        qs: opts
      }, callback)
    })
  }
}
