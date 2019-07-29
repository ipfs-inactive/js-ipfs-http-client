'use strict'

const { Readable, Writable } = require('stream')

function toReadable (source) {
  let reading = false
  return new Readable({
    async read (size) {
      if (reading) return
      reading = true

      try {
        while (true) {
          const { value, done } = await source.next(size)
          if (done) return this.push(null)
          if (!this.push(value)) break
        }
      } catch (err) {
        this.emit('error', err)
        if (source.return) source.return()
      } finally {
        reading = false
      }
    }
  })
}

module.exports = toReadable
module.exports.readable = toReadable

function toWritable (sink) {
  const END_CHUNK = {}

  class Buf {
    constructor () {
      this._buffer = []
      this._waitingConsumers = []
      this._consuming = false
    }

    push (chunk) {
      let resolver
      const pushPromise = new Promise((resolve, reject) => {
        resolver = { resolve, reject }
      })
      this._buffer.push({ chunk, resolver })
      this._consume()
      return pushPromise
    }

    _consume () {
      if (this._consuming) return
      this._consuming = true

      while (this._waitingConsumers.length && this._buffer.length) {
        const nextConsumer = this._waitingConsumers.shift()
        const nextChunk = this._buffer.shift()
        nextConsumer.resolver.resolve(nextChunk)
        nextChunk.resolver.resolve()
      }

      this._consuming = false
    }

    consume () {
      let resolver
      const consumePromise = new Promise((resolve, reject) => {
        resolver = { resolve, reject }
      })
      this._waitingConsumers.push({ resolver })
      this._consume()
      return consumePromise
    }
  }

  const buf = new Buf()

  const it = {
    async next () {
      const chunk = await buf.consume()
      return chunk === END_CHUNK ? { done: true } : { value: chunk }
    }
  }

  sink({
    [Symbol.asyncIterator] () {
      return it
    }
  })

  return new Writable({
    write (chunk, enc, cb) {
      buf.push(chunk).then(() => cb(), cb)
    },
    final (cb) {
      buf.push(END_CHUNK).then(() => cb(), cb)
    }
  })
}

module.exports.toWritable = toWritable
