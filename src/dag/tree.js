'use strict'
const promisify = require('promisify-es6')
const block = require('../block')

const DAGFormats = {
  'dag-cbor': require('ipld-dag-cbor'),
  'dag-pb': require('ipld-dag-pb')
}

module.exports = (send) => {
  return promisify((cid, path, options, callback) => {
    if (typeof path === 'function') {
      callback = path
      path = undefined
    }

    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = options || {}
    path = path || ''

    // FIXME: handle case when options.recursive is true
    block(send).get(cid, options, (err, ipfsBlock) => {
      if (err) return callback(err)

      const codec = ipfsBlock.cid.codec
      if (codec in DAGFormats) {
        DAGFormats[codec].resolver.tree(ipfsBlock.data, callback)
      } else {
        callback(new Error(`codec ${codec} is not valid`), null)
      }
    })
  })
}
