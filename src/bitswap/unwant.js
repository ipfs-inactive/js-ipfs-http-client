'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    // Mirrors block.get's parsing of the CID
    let cid
    try {
      if (CID.isCID(args)) {
        cid = args
        args = cid.toBaseEncodedString()
      } else if (Buffer.isBuffer(args)) {
        cid = new CID(args)
        args = cid.toBaseEncodedString()
      } else if (typeof args === 'string') {
        cid = new CID(args)
      } else {
        return callback(new Error('invalid argument'))
      }
    } catch (err) {
      return callback(err)
    }

    send({
      path: 'bitswap/unwant',
      args: args,
      qs: opts
    }, callback)
  })
}
