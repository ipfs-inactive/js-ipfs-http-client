'use strict'

const IsIpfs = require('is-ipfs')
const promisify = require('promisify-es6')
const streamToValueWithTransformer = require('../utils/stream-to-value-with-transformer')
const moduleConfig = require('../utils/module-config')
const cleanCID = require('../utils/clean-cid')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  const refs = promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    try {
      args = cleanCID(args)
    } catch (err) {
      if (!IsIpfs.ipfsPath(args)) {
        return callback(err)
      }
    }

    const transform = (res, cb) => {
      cb(null, res.map(r => ({ ref: r.Ref, err: r.Err })))
    }

    const request = {
      path: 'refs',
      args: args,
      qs: opts
    }
    send(request, (err, result) => {
      if (err) {
        return callback(err)
      }

      streamToValueWithTransformer(result, transform, callback)
    })
  })

  refs.local = require('./refs-local')(arg)
  refs.localReadableStream = require('./refs-local-readable-stream')(arg)
  refs.localPullStream = require('./refs-local-pull-stream')(arg)

  return refs
}
