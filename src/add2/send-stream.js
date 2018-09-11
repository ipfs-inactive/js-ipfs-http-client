'use strict'
const { Duplex, Transform } = require('stream')
const isStream = require('is-stream')
const nanoid = require('nanoid')
const pump = require('pump')
const Multipart = require('./multipart2')
const { prepareWithHeaders } = require('./../utils/prepare-file')

/** @private @typedef {import("./add2").AddOptions} AddOptions */

const noop = () => {}

/**
 * Factory for prepare stream
 * @private
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
 * @private
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
    this.waiting = null
    this.options = options
    this.send = send
    this.multipart = new Multipart(options)
    this.boundary = this.multipart._boundary
    this.uuid = nanoid()
    this.index = 0
    this.rangeStart = 0
    this.rangeEnd = 0
    this.rangeTotal = 0
    this.running = false
    this.extraBytes = 0
    this.totalUp = 0
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
      this.multipart.on('end', this.onEnd.bind(this))
      this.multipart.on('data', this.onData.bind(this))
    }
  }

  _write (chunk, encoding, callback) {
    this.source.write(chunk)
    callback()
  }

  _final () {
    this.source.end()
  }

  _read (size) {
    // read
  }

  onEnd () {
    console.log('End', this.rangeTotal)

    // wait for all chunks to be sent
    // doing all this in the end should simplify future concurrent chunk uploads
    if (this.running && this.waiting === null) {
      this.waiting = setInterval(() => {
        if (!this.running) {
          clearInterval(this.waiting)
          this.waiting = null
          this.requestChunk(null)
        }
      }, 100)
    } else {
      this.requestChunk(null)
    }
  }

  onData (chunk) {
    console.log('Send ', chunk.length)
    // stop producing chunks
    this.multipart.pauseAll()
    this.extraBytes = this.multipart.extraBytes
    this.index++
    this.rangeEnd = this.rangeStart + chunk.length
    this.rangeTotal += chunk.length
    this.running = true
    this.requestChunk(chunk)
      .then(() => {
        this.running = false
        this.rangeStart = this.rangeEnd
        this.multipart.resumeAll()
      })
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

        // we are in the last request
        if (isStream(res)) {
          res.on('data', (d) => {
            if (d.path) {
            // files added reporting
              this.push(d)
            } else {
            // progress add reporting
              progressFn((d.Bytes / 2) + this.totalUp)
            }
          })
          res.on('error', err => this.emit('error', err))
          res.on('end', () => {
            resolve()
            this.push(null)
          })
        } else {
        // progress upload reporting
          this.totalUp = (this.rangeTotal - this.extraBytes) / 2
          progressFn(this.totalUp)
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
        if (d.hash) {
          // files added reporting
          this.push(d)
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
