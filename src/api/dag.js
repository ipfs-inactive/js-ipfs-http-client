'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const promisify = require('promisify-es6')
const bs58 = require('bs58')
const streamToValue = require('../stream-to-value')
const cleanMultihash = require('../clean-multihash')
const LRU = require('lru-cache')

const lruOptions = {
  max: 128
}

const Unixfs = require('ipfs-unixfs')
const cache = LRU(lruOptions)

module.exports = (send) => {
  const api = {
    get: promisify((cid, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      const node = cache.get(cid)

      if (node) { return callback(null, node) }

      send({
        path: 'dag/get',
        args: cid
      }, (err, result) => {
        if (err) {
          return callback(err)
        }

        // TODO we need to get the raw bytes
      })
    }),

    put: promisify((dagNode, multicodec, hashAlg, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      send({
        path: 'dag/put',
        qs: {
          format: multicodec,
          inputenc: enc
        },
        files: buf
      }, (err, result) => {
        if (err) { return callback(err) }

        // TODO should get the CID back
      })
    })
  }

  return api
}
