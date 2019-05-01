'use strict'

const IsIpfs = require('is-ipfs')
const promisify = require('promisify-es6')
const streamToValue = require('../utils/stream-to-value')
const moduleConfig = require('../utils/module-config')
const cleanCID = require('../utils/clean-cid')

function valueOrStreamToValue (response, callback) {
  if (typeof response.pipe === 'function') {
    streamToValue(response, callback)
  } else {
    callback(null, response)
  }
}

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

    const request = {
      path: 'refs',
      args: args,
      qs: opts
    }

    send.andTransform(request, valueOrStreamToValue, callback)
  })

  refs.local = require('./refs-local')(arg)
  refs.localReadableStream = require('./refs-local-readable-stream')(arg)
  refs.localPullStream = require('./refs-local-pull-stream')(arg)

  return refs
}
