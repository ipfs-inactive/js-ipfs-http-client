'use strict'

const promisify = require('promisify-es6')
const Block = require('ipfs-block')
const CID = require('cids')
const once = require('once')
const SendOneFile = require('../utils/send-one-file')
const multihashes = require('multihashes')

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'block/put')

  return promisify((block, opts, _callback) => {
    // TODO this needs to be adjusted with the new go-ipfs http-api
    if (typeof opts === 'function') {
      _callback = opts
      opts = {}
    }

    const callback = once(_callback)

    if (Array.isArray(block)) {
      return callback(new Error('block.put accepts only one block'))
    }

    let cid = opts.cid

    if (typeof block === 'object' && block.data) {
      if (block.cid) cid = block.cid
      block = block.data
    }

    let qs = Object.assign(opts,
      {'input-enc': 'raw',
       hashAlg: opts.mhtype || 'sha2-256'
      }
    )

    if (cid && CID.isCID(cid)) {
      qs.format = cid.codec
      qs.hashAlg = multihashes.decode(cid.multihash).name
    }
    delete qs.cid

    let _send = sendOneFile

    console.error(qs)

    if (qs.format && qs.format.startsWith('dag-')) {
      _send = SendOneFile(send, 'dag/put')
    }

    _send(block, {qs}, (err, result) => {
      if (err) {
        return callback(err) // early
      }
      let cid = result.Key || result.Cid['/']
      callback(null, new Block(block, new CID(cid)))
    })
  })
}
