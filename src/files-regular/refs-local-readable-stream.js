'use strict'

const cleanCID = require('../utils/clean-cid')
const v = require('is-ipfs')
const Stream = require('readable-stream')
const pump = require('pump')

module.exports = (send) => {
  return (opts) => {
    opts = opts || {}

    const pt = new Stream.PassThrough({ objectMode: true })

    send({ path: 'refs/local', qs: opts }, (err, stream) => {
      if (err) { return pt.destroy(err) }

      pump(stream, pt)
    })

    return pt
  }
}
