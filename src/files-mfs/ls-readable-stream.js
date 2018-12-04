'use strict'

const {
  Transform
} = require('stream')
const pump = require('pump')
const ndjson = require('ndjson')

module.exports = (send) => {
  return (args, opts) => {
    opts = opts || {}

    const transform = new Transform({
      objectMode: true,

      transform (entry, encoding, callback) {
        callback(null, {
          name: entry.Name,
          type: entry.Type,
          size: entry.Size,
          hash: entry.Hash
        })
      }
    })

    send({
      path: 'files/ls',
      args: args,
      qs: {
        ...opts,
        stream: true
      }
    }, (err, stream) => {
      if (err) {
        return transform.destroy(err)
      }

      const outputStream = ndjson.parse()

      pump(stream, outputStream, transform)
    })

    return transform
  }
}
