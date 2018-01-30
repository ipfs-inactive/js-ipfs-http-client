'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../utils/stream-to-value')
const { Transform } = require('readable-stream')

const transformChunk = (chunk) => {
  return {
    totalIn: chunk.TotalIn,
    totalOut: chunk.TotalOut,
    rateIn: chunk.RateIn,
    rateOut: chunk.RateOut
  }
}

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'stats/bw',
      qs: opts
    }, (res, callback) => {
      if (!opts.poll) {
        // If not polling, just send the result.
        return streamToValue(res, (err, data) => {
          if (err) {
            return callback(err)
          }

          callback(null, transformChunk(data[0]))
        })
      }

      // If polling, return a readable stream.
      const output = new Transform({
        objectMode: true,
        transform (chunk, encoding, cb) {
          cb(null, transformChunk(chunk))
        }
      })

      res.pipe(output)
      callback(null, output)
    }, callback)
  })
}
