'use strict'

const promisify = require('promisify-es6')
const streamToValueWithTransformer = require('../utils/stream-to-value-with-transformer')

const errcode = require('err-code')

module.exports = (send) => {
  return promisify((peerId, opts, callback) => {
    if (typeof opts === 'function' && !callback) {
      callback = opts
      opts = {}
    }

    // opts is the real callback --
    // 'callback' is being injected by promisify
    if (typeof opts === 'function' && typeof callback === 'function') {
      callback = opts
      opts = {}
    }

    const handleResult = (res, callback) => {
      // Inconsistent return values in the browser
      if (Array.isArray(res)) {
        res = res[0]
      }

      // Type 2 keys (inconsistencies between go core and js core)
      if (res.Type !== 2 && res.type !== 2) {
        const errMsg = `key was not found (type 2)`

        return callback(errcode(new Error(errMsg), 'ERR_KEY_TYPE_2_NOT_FOUND'))
      }

      // inconsistencies between go core and js core
      let id
      let addrs

      if (res.Responses) {
        id = res.Responses[0].ID
        addrs = res.Responses[0].Addrs
      } else {
        id = res.responses[0].id
        addrs = res.responses[0].addrs
      }

      // inconsistencies js / go - go does not add `/ipfs/{id}` to the address
      addrs = addrs.map((addr) => {
        if (addr.split('/ipfs/') > -1) {
          return addr
        } else {
          return `${addr}/ipfs/${id}`
        }
      })

      callback(null, {
        responses: [{
          id,
          addrs
        }]
      })
    }

    send({
      path: 'dht/findpeer',
      args: peerId,
      qs: opts
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      streamToValueWithTransformer(result, handleResult, callback)
    })
  })
}
