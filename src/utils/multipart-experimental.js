'use strict'

const { Duplex, PassThrough } = require('stream')
const { isSource } = require('is-pull-stream')
const pump = require('pump')
const pullToStream = require('pull-stream-to-stream')
const bufferToStream = require('buffer-to-stream')

/** @private @typedef {import("../files/add-experimental").AddOptions} AddOptions */

const PADDING = '--'
const NEW_LINE = '\r\n'
const NEW_LINE_BUFFER = Buffer.from(NEW_LINE)

/**
 * Generate a random boundary to use in a multipart request
 *
 * @private
 * @returns {string}
 */
const generateBoundary = () => {
  var boundary = '--------------------------'
  for (var i = 0; i < 24; i++) {
    boundary += Math.floor(Math.random() * 10).toString(16)
  }

  return boundary
}

/**
 * Generate leading section for a multipart body
 *
 * @private
 * @param {Object} [headers={}]
 * @param {string} boundary
 * @returns {string}
 */
const leading = (headers = {}, boundary) => {
  var leading = [PADDING + boundary]

  Object.keys(headers).forEach((header) => {
    leading.push(header + ': ' + headers[header])
  })

  leading.push('')
  leading.push('')

  const leadingStr = leading.join(NEW_LINE)

  return Buffer.from(leadingStr)
}

/**
 * Multipart class to generate a multipart body chunked and non chunked
 *
 * @private
 * @class Multipart
 * @extends {Duplex}
 */
class Multipart extends Duplex {
  /**
   * Creates an instance of Multipart.
   * @param {AddOptions} options
   */
  constructor (options) {
    super({
      writableObjectMode: true,
      writableHighWaterMark: 1,
      readableHighWaterMark: options.chunkSize ? Math.max(136, options.chunkSize) : 16384 // min is 136
    })

    this._boundary = generateBoundary()
    this.source = null
    this.chunkSize = options.chunkSize || 0
    this.buffer = Buffer.alloc(this.chunkSize)
    this.bufferOffset = 0
    this.extraBytes = 0
    this.sourceReadable = false
  }

  _read () {
    // empty read
  }

  _write (file, encoding, callback) {
    this.pushFile(file, () => {
      callback()
    })
  }

  _final (callback) {
    // Flush the rest and finish
    const tail = Buffer.from(PADDING + this._boundary + PADDING + NEW_LINE)
    if (this.chunkSize === 0) {
      this.push(tail)
    } else {
      this.extraBytes += tail.length
      const slice = this.buffer.slice(0, this.bufferOffset)

      this.bufferOffset = 0
      this.push(Buffer.concat([slice, tail], slice.length + tail.length))
    }

    this.push(null)
    callback()
  }

  resume () {
    super.resume()

    // Chunked mode
    if (this.chunkSize > 0 && this.sourceReadable) {
      let chunk
      while (!this.isPaused() && (chunk = this.source.read(this.chunkSize - this.bufferOffset)) !== null) {
        this.pushChunk(chunk)
      }
    }
  }

  /**
   * Push chunk
   *
   * @param {Buffer} chunk
   * @param {boolean} [isExtra=false]
   * @return {boolean}
   */
  pushChunk (chunk, isExtra = false) {
    if (chunk === null) {
      return this.push(null)
    }

    if (this.chunkSize === 0) {
      return this.push(chunk)
    }

    if (isExtra) {
      this.extraBytes += chunk.length
    }

    if (this.bufferOffset === 0 && chunk.length === this.chunkSize) {
      return this.push(chunk)
    }

    const bytesNeeded = (this.chunkSize - this.bufferOffset)
    // make sure we have the correct amount of bytes
    if (chunk.length === bytesNeeded) {
      // chunk.copy(this.buffer, this.bufferOffset, 0, bytesNeeded)
      const slice = this.buffer.slice(0, this.bufferOffset)
      this.bufferOffset = 0
      return this.push(Buffer.concat([slice, chunk], slice.length + chunk.length))
    }

    if (chunk.length > bytesNeeded) {
      this.emit('error', new RangeError(`Chunk is too big needed ${bytesNeeded} got ${chunk.length}`))
      return false
    }

    chunk.copy(this.buffer, this.bufferOffset)
    this.bufferOffset += chunk.length

    return true
  }

  pushFile (file, callback) {
    this.pushChunk(leading(file.headers, this._boundary), true)

    this.source = file.content || Buffer.alloc(0)

    if (Buffer.isBuffer(this.source)) {
      this.source = bufferToStream(this.source)
    }

    if (isSource(file.content)) {
      // pull-stream-to-stream doesn't support readable event...
      this.source = pump([pullToStream.source(file.content), new PassThrough()])
    }

    this.source.on('readable', () => {
      this.sourceReadable = true
      let chunk = null
      if (this.chunkSize === 0) {
        if ((chunk = this.source.read()) !== null) {
          this.pushChunk(chunk)
        }
      } else {
        while (!this.isPaused() && (chunk = this.source.read(this.chunkSize - this.bufferOffset)) !== null) {
          this.pushChunk(chunk)
        }
      }
    })

    this.source.on('end', () => {
      this.sourceReadable = false
      this.pushChunk(NEW_LINE_BUFFER, true)
      callback()
    })

    this.source.on('error', err => this.emit('error', err))
  }
}

module.exports = Multipart
