'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    if (!Array.isArray(args)) {
      args = Array(args)
    }

    try {
      for (let i = 0; i < args.length; i++) {
        args[i] = new CID(args[i]).toString()
      }
    } catch (err) {
      return callback(err)
    }
    // args is now a valid, list of serialized (string) CID

    const request = {
      path: 'block/rm',
      args: args,
      qs: opts || {}
    }

    // Transform the response from { Hash, Error } objects to { hash, error } objects
    const transform = (stats, callback) => {
      callback(null, {
        hash: stats.Hash,
        error: stats.Error
      })
    }

    send.andTransform(request, transform, callback)
  })
}
