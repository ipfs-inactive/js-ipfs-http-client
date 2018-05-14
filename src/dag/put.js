'use strict'

const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const promisify = require('promisify-es6')
const CID = require('cids')
const multihash = require('multihashes')
const setImmediate = require('async/setImmediate')
const SendOneFile = require('../utils/send-one-file')

function noop () {}

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'dag/put')

  return promisify((dagNode, options, callback) => {
    if (typeof options === 'function') {
      return setImmediate(() => callback(new Error('no options were passed')))
    }

    callback = callback || noop

    let hashAlg = options.hash || 'sha2-256'
    let format
    let inputEnc

    if (options.cid && CID.isCID(options.cid)) {
      format = options.cid.codec
      hashAlg = multihash.decode(options.cid.multihash).name
      prepare()
    } else if (options.format) {
      format = options.format
      prepare()
    } else {
      callback(new Error('Invalid arguments'))
    }

    function prepare () {
      inputEnc = 'raw'

      if (format === 'dag-cbor') {
        dagCBOR.util.serialize(dagNode, finalize)
      }
      if (format === 'dag-pb') {
        dagPB.util.serialize(dagNode, finalize)
      }
    }

    function finalize (err, serialized) {
      if (err) { return callback(err) }
      const sendOptions = {
        qs: {
          hash: hashAlg,
          format: format,
          'input-enc': inputEnc
        }
      }
      sendOneFile(serialized, sendOptions, (err, result) => {
        if (err) {
          return callback(err)
        }
        if (result['Cid']) {
          return callback(null, new CID(result['Cid']['/']))
        } else {
          return callback(result)
        }
      })
    }
  })
}
