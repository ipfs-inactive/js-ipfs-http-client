'use strict'

const promisify = require('promisify-es6')
const Block = require('ipfs-block')
const CID = require('cids')
const streamToValue = require('../utils/stream-to-value')

module.exports = (send) => {
  return promisify((cid, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    try {
      cid = new CID(cid)
    } catch (err) {
      return callback(err)
    }

    // Transform the response from Buffer or a Stream to a Block
    const transform = (res, callback) => {
      if (Buffer.isBuffer(res)) {
        callback(null, new Block(res, cid))
      // For empty blocks, concat-stream can't infer the encoding so we are
      // passed back an empty array
      } else if (Array.isArray(res) && res.length === 0) {
        callback(null, new Block(Buffer.alloc(0), cid))
      } else {
        streamToValue(res, (err, data) => {
          if (err) {
            return callback(err)
          }
          // For empty blocks, concat-stream can't infer the encoding so we are
          // passed back an empty array
          if (!data.length) data = Buffer.alloc(0)
          callback(null, new Block(data, cid))
        })
      }
    }

    const request = {
      path: 'block/get',
      args: cid.toBaseEncodedString(),
      qs: opts
    }

    send.andTransform(request, transform, callback)
  })
}
