'use strict'

module.exports = function toIterable (res) {
  // An env where res.body getter for ReadableStream with getReader
  // is not supported, for example in React Native
  if (!res.body) {
    return (async function * () {
      const arrayBuffer = await res.arrayBuffer()
      yield arrayBuffer
    })()
  }

  const { body } = res

  // Node.js stream
  if (body[Symbol.asyncIterator]) return body

  // Browser ReadableStream
  if (body.getReader) {
    return (async function * () {
      const reader = body.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) return
          yield value
        }
      } finally {
        reader.releaseLock()
      }
    })()
  }

  throw new Error('unknown stream')
}
