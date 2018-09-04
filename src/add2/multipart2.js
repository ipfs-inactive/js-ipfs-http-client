'use strict'

const { Duplex } = require('stream')
const { isSource } = require('is-pull-stream')
const toStream = require('pull-stream-to-stream')

const PADDING = '--'
const NEW_LINE = '\r\n'
const NEW_LINE_BUFFER = Buffer.from(NEW_LINE)

const generateBoundary = () => {
  var boundary = '--------------------------'
  for (var i = 0; i < 24; i++) {
    boundary += Math.floor(Math.random() * 10).toString(16)
  }

  return boundary
}

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

class Multipart extends Duplex {
  constructor ({ chunkSize = 256000 } = {}) {
    super({ writableObjectMode: true, writableHighWaterMark: 1 })

    this._boundary = generateBoundary()
    this.source = null
    this.chunkSize = chunkSize
    this.buffer = Buffer.alloc(this.chunkSize)
    this.bufferOffset = 0
    this.running = true
  }

  _read () {
    if (this.source) {
      this.source.resume()
    }
  }

  _write (file, encoding, callback) {
    this.pushFile(file, () => {
      this.pushChunk(Buffer.from(PADDING + this._boundary + PADDING + NEW_LINE))
      callback()
    })
  }

  _final (callback) {
    // Flush the rest and finish
    if (this.bufferOffset) {
      this.push(this.buffer.slice(0, this.bufferOffset))
      this.bufferOffset = 0
    }
    this.running = false
    this.push(null)
    callback()
  }

  pushChunk (chunk) {
    const bytesNeeded = (this.chunkSize - this.bufferOffset)
    let result = true
    if (chunk === null) {
      return this.push(null)
    }

    // If we have enough bytes in this chunk to get buffer up to chunkSize,
    // fill in buffer, push it, and reset its offset.
    // Otherwise, just copy the entire chunk in to buffer.
    if (chunk.length >= bytesNeeded) {
      chunk.copy(this.buffer, this.bufferOffset, 0, bytesNeeded)
      result = this.push(this.buffer)
      this.bufferOffset = 0
      // Handle leftovers from the chunk
      const leftovers = chunk.slice(0, chunk.length - bytesNeeded)
      let size = leftovers.length
      while (size >= this.chunkSize) {
        result = this.push(chunk.slice(this.bufferOffset, this.bufferOffset + this.chunkSize))
        this.bufferOffset += this.chunkSize
        size -= this.chunkSize
      }
      // if we still have anything left copy to the buffer
      chunk.copy(this.buffer, 0, this.bufferOffset, this.bufferOffset + size)
      this.bufferOffset = size
    } else {
      chunk.copy(this.buffer, this.bufferOffset)
      this.bufferOffset += chunk.length
    }

    return result
  }

  pushFile (file, callback) {
    this.pushChunk(leading(file.headers, this._boundary))

    let content = file.content || Buffer.alloc(0)

    if (Buffer.isBuffer(content)) {
      this.pushChunk(content)
      this.pushChunk(NEW_LINE_BUFFER)
      return callback() // early
    }

    if (isSource(content)) {
      content = toStream.source(content)
    }
    this.source = content

    // From now on we assume content is a stream
    content.on('data', (data) => {
      if (!this.pushChunk(data)) {
        content.pause()
      }
    })
    content.once('error', this.emit.bind(this, 'error'))

    content.once('end', () => {
      this.pushChunk(NEW_LINE_BUFFER)
      callback()
    })
  }
}

module.exports = Multipart
