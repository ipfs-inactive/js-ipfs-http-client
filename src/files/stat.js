'use strict'

const promisify = require('promisify-es6')
const _ = require('lodash')

const transform = function (res, callback) {
  callback(null, {
    type: res.Type,
    blocks: res.Blocks,
    size: res.Size,
    hash: res.Hash,
    cumulativeSize: res.CumulativeSize,
    withLocality: res.WithLocality || false,
    local: res.Local || undefined,
    sizeLocal: res.SizeLocal || undefined
  })
}

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    opts = _.mapKeys(opts, (v, k) => _.kebabCase(k))

    send.andTransform({
      path: 'files/stat',
      args: args,
      qs: opts
    }, transform, callback)
  })
}
