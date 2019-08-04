'use strict'
/* eslint-env browser */

const toIterator = require('pull-stream-to-async-iterator')
const { Buffer } = require('buffer')
const blobToAsyncIterable = require('../lib/blob-to-async-iterable')
const isBloby = require('../lib/is-bloby')

/*
Transform one of:

Buffer|ArrayBuffer|TypedArray
Blob|File
Iterable<Number>
AsyncIterable<Buffer>
PullStream<Buffer>

Into:

AsyncIterable<Buffer>
*/
module.exports = function toAsyncIterable (input) {
  // Buffer|ArrayBuffer|TypedArray|array of bytes
  if (input[Symbol.iterator]) {
    const buf = Buffer.from(input)
    return Object.assign(
      (async function * () { yield buf })(), // eslint-disable-line require-await
      { length: buf.length }
    )
  }

  // Blob|File
  if (isBloby(input)) {
    return Object.assign(
      blobToAsyncIterable(input),
      { length: input.size }
    )
  }

  // AsyncIterable<Buffer>
  if (input[Symbol.asyncIterator]) {
    return (async function * () {
      for await (const chunk of input) {
        yield Buffer.from(chunk)
      }
    })()
  }

  // PullStream
  if (typeof input === 'function') {
    return toIterator(input)
  }

  throw new Error('Unexpected input: ' + typeof input)
}
