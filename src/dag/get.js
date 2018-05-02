'use strict'

const promisify = require('promisify-es6')
const IPLDResolver = require('ipld')
const explain = require('explain-error')
const ipfsPath = require('../utils/ipfs-path')
const block = require('../block')

module.exports = (send) => {
  const blockGet = block(send).get

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

    try {
      const res = ipfsPath(cid)
      cid = res.cid
      path = res.path || path
    } catch (err) {
      return callback(err)
    }

    IPLDResolver.inMemory((err, ipld) => {
      if (err) return callback(explain(err, 'failed to create IPLD resolver'))
      ipld.bs.setExchange({ get: blockGet })
      ipld.get(cid, path, options, callback)
    })
  })
}
