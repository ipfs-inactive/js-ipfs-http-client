'use strict'
const { Duplex, Transform } = require('stream')
const isStream = require('is-stream')
const nanoid = require('nanoid')
const pump = require('pump')
const Multipart = require('./multipart-experimental')
const { prepareWithHeaders } = require('./prepare-file')

/** @ignore @typedef {import("../files/add-experimental").AddOptions} AddOptions */

const noop = () => {}

/**
 * Convert back to the proper schema
 *
 * @ignore
 * @param {Object} data
 * @returns {Object}
 */
const convert = (data) => {
  return {
    path: data.Name,
    hash: data.Hash,
    size: data.Size
  }
}

/**
 * Factory for prepare stream
 * @ignore
 * @param {*} options
 * @returns {Function}
 */
const prepareTransform = (options) => new Transform({
  objectMode: true,
  transform (chunk, encoding, callback) {
    try {
      callback(null, prepareWithHeaders(chunk, options))
    } catch (err) {
      callback(err)
    }
  }
})

/**
 * Class to create a stream to send data to the API
 *
 * @ignore
 * @class SendStream
 * @extends {Duplex}
 */
class SendStream extends Duplex {
  /**
   * Creates an instance of SendStream.
   * @param {Function} send
   * @param {AddOptions} [options={}]
   */
  constructor (send, options = {}) {
    super({ objectMode: true, highWaterMark: 1 })
    this.options = options
    this.send = send
    this.multipart = new Multipart(options)
    this.boundary = this.multipart._boundary
    this.uuid = nanoid()
    this.index = 0
    this.rangeStart = 0
    this.rangeEnd = 0
    this.rangeTotal = 0
    this.qs = {
      'cid-version': this.options['cid-version'],
      'raw-leaves': this.options['raw-leaves'],
      'only-hash': this.options.onlyHash,
      'wrap-with-directory': this.options.wrapWithDirectory,
      hash: this.options.hashAlg || this.options.hash
    }

    this.args = {
      path: 'add-chunked',
      qs: this.qs,
      args: this.options.args,
      stream: true,
      recursive: true,
      progress: Boolean(this.options.progress),
      multipart: true,
      multipartBoundary: this.boundary
    }

    this.source = prepareTransform(options)

    pump([
      this.source,
      this.multipart,
      !options.chunkSize && this.request()
    ].filter(Boolean), (err) => {
      if (err) {
        this.emit('error', err)
      }
    })

    if (options.chunkSize) {
      this.multipart.on('data', this.onData.bind(this))
    }
  }

  _read () {
    // duplex stream needs to implement _read()
  }

  _write (chunk, encoding, callback) {
    this.source.write(chunk)
    callback()
  }

  _final () {
    this.source.end()
  }

  onData (chunk) {
    this.multipart.pause()
    // stop producing chunks
    this.index++
    this.rangeEnd = this.rangeStart + chunk.length
    this.rangeTotal += chunk.length
    this.requestChunk(chunk)
      .then(() => {
        this.multipart.resume()
      })
    this.rangeStart = this.rangeEnd
  }

  requestChunk (chunk) {
    this.args.headers = {
      'Content-Range': `bytes ${this.rangeStart}-${this.rangeEnd}/${this.rangeTotal}`,
      'X-Chunked-Input': `uuid="${this.uuid}"; index=${this.index}`
    }
    return new Promise((resolve, reject) => {
      const progressFn = this.options.progress || noop
      const req = this.send(this.args, (err, res) => {
        if (err) {
          return this.emit('error', err)
        }

        // progress upload reporting
        const totalUp = Math.max((this.rangeTotal - this.multipart.extraBytes) / 2, 0)
        progressFn(totalUp)
        // we are in the last request
        if (isStream(res)) {
          res.on('data', d => {
            if (d.Hash) {
              // files added reporting
              this.push(convert(d))
            } else {
              // progress add reporting
              progressFn((d.Bytes / 2) + totalUp)
            }
          })
          res.on('error', err => this.emit('error', err))
          res.on('end', () => {
            resolve()
            this.push(null)
          })
        } else {
          resolve()
        }
      })

      // write and send
      if (chunk !== null) {
        req.write(Buffer.from(chunk))
      }
      req.end()
    })
  }

  request () {
    const progressFn = this.options.progress || noop
    return this.send(this.args, (err, res) => {
      if (err) {
        return this.emit('error', err)
      }

      res.on('data', (d) => {
        if (d.Hash) {
          // files added reporting
          this.push(convert(d))
        } else {
          // progress add reporting
          progressFn(d.Bytes)
        }
      })
      res.on('error', err => this.emit('error', err))
      res.on('end', () => {
        this.push(null)
      })
    })
  }
}

module.exports = SendStream
