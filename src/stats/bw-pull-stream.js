'use strict'

const toPull = require('stream-to-pull-stream')
const pull = require('pull-stream')
const transformChunk = require('./bw-util')
const deferred = require('pull-defer')

const transform = () => (read) => (abort, cb) => {
  read(abort, (err, data) => {
    console.log(data)
    if (err) return cb(err)
    cb(null, transformChunk(data))
  })
}

module.exports = (send) => {
  return (hash, opts) => {
    opts = opts || {}

    const p = deferred.through()

    send({
      path: 'stats/bw',
      qs: opts
    }, (err, stream) => {
      if (err) {
        return p.end(err)
      }

      pull(toPull(stream), p)
      p.resolve(transform)
    })

    return p
  }
}
