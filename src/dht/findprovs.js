'use strict'

const promisify = require('promisify-es6')
const streamToValueWithTransformer = require('../utils/stream-to-value-with-transformer')

const errcode = require('err-code')

module.exports = (send) => {
  return promisify((cid, opts, callback) => {
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
      // Inconsistent return values in the browser vs node
      if (Array.isArray(res)) {
        res = res[0]
      }

      // Type 4 keys (inconsistencies between go core and js core)
      if (res.Type !== 4 && res.type !== 4) {
        const errMsg = `key was not found (type 4)`

        return callback(errcode(new Error(errMsg), 'ERR_KEY_TYPE_4_NOT_FOUND'))
      }

      // inconsistencies between go core and js core
      const recResponses = res.Responses || res.responses

      // providers array (handling inconsistencies)
      const responses = recResponses.map((r) => ({
        id: r.ID || r.id,
        addrs: r.Addrs || r.addrs
      }))

      callback(null, { responses })
    }

    send({
      path: 'dht/findprovs',
      args: cid,
      qs: opts
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      streamToValueWithTransformer(result, handleResult, callback)
    })
  })
}
