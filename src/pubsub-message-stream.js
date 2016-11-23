'use strict'

const TransformStream = require('readable-stream').Transform
const PubsubMessage = require('./pubsub-message-utils')

class PubsubMessageStream extends TransformStream {
  constructor (options) {
    const opts = Object.assign(options || {}, { objectMode: true })
    super(opts)
  }

  static from (inputStream, callback) {
    let outputStream = inputStream.pipe(new PubsubMessageStream())
    inputStream.on('end', () => outputStream.emit('end'))
    callback(null, outputStream)
  }

  _transform (obj, enc, callback) {
    try {
      const message = PubsubMessage.deserialize(obj, 'base64')
      this.push(message)
    } catch (e) {
      // Not a valid pubsub message
      // go-ipfs returns '{}' as the very first object atm, we skip that
    }
    callback()
  }
}

module.exports = PubsubMessageStream
