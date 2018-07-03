'use strict'

const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const promisify = require('promisify-es6')
const CID = require('cids')
const multihash = require('multihashes')
const SendOneFile = require('../utils/send-one-file')

function noop () {}

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'dag/put')

  return promisify((dagNode, options, callback) => {
    if (typeof options === 'function') {
      callback = options
    } else if (options.cid && (options.format || options.hash)) {
      return callback(new Error('Can\'t put dag node. Please provide either `cid` OR `format` and `hash` options.'))
    } else if ((options.format && !options.hash) || (!options.format && options.hash)) {
      return callback(new Error('Can\'t put dag node. Please provide `format` AND `hash` options.'))
    }

    callback = callback || noop

    const optionDefaults = {
      format: 'dag-cbor',
      hash: 'sha2-255',
      inputEnc: 'raw'
    }

    let hashAlg = options.hash || optionDefaults.hash
    let format = optionDefaults.format
    let inputEnc = optionDefaults.inputEnc

    if (options.cid && CID.isCID(options.cid)) {
      format = options.cid.codec
      hashAlg = multihash.decode(options.cid.multihash).name
      prepare()
    } else {
      format = options.format
      prepare()
    }

    function prepare () {
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
