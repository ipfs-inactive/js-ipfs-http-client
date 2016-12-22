'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    /**
     * @alias files.cp
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    cp: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'files/cp',
        args: args,
        qs: opts
      }, callback)
    }),

    /**
     * @alias files.ls
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    ls: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'files/ls',
        args: args,
        qs: opts
      }, callback)
    }),

    /**
     * @alias files.mkdir
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    mkdir: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'files/mkdir',
        args: args,
        qs: opts
      }, callback)
    }),

    /**
     * @alias files.stat
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    stat: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'files/stat',
        args: args,
        qs: opts
      }, callback)
    }),

    /**
     * @alias files.rm
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    rm: promisify((path, opts, callback) => {
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

      send({
        path: 'files/rm',
        args: path,
        qs: opts
      }, callback)
    }),

    /**
     * @alias files.read
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    read: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'files/read',
        args: args,
        qs: opts
      }, callback)
    }),

    /**
     * @alias files.write
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    write: promisify((pathDst, files, opts, callback) => {
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

      send({
        path: 'files/write',
        args: pathDst,
        qs: opts,
        files: files
      }, callback)
    }),

    /**
     * @alias files.mv
     * @method
     * @returns {Promise|undefined}
     * @memberof IpfsApi#
     */
    mv: promisify((args, opts, callback) => {
      if (typeof opts === 'function' &&
          callback === undefined) {
        callback = opts
        opts = {}
      }
      send({
        path: 'files/mv',
        args: args,
        qs: opts
      }, callback)
    })
  }
}
