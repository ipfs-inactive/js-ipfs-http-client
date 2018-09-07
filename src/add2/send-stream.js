'use strict'
const { Duplex, Transform } = require('stream')
const isStream = require('is-stream')
const pump = require('pump')
const Multipart = require('./multipart2')
const { prepareWithHeaders } = require('./../utils/prepare-file')

const noop = () => {}
/**
 * Poor man's uuid
 *
 * @returns {String}
 */
function uuid () {
  function chr4 () {
    return Math.random().toString(16).slice(-4)
  }
  return chr4() + chr4() +
        '-' + chr4() +
        '-' + chr4() +
        '-' + chr4() +
        '-' + chr4() + chr4() + chr4()
}

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

class SendStream extends Duplex {
  constructor (send, options) {
    super({ objectMode: true, highWaterMark: 1 })
    this.waiting = null
    this.options = options
    this.send = send
    this.multipart = new Multipart(options)
    this.boundary = this.multipart._boundary
    this.id = uuid()
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
    const args = {
      path: 'add-chunked',
      qs: this.qs,
      args: this.options.args,
      stream: true,
      recursive: true,
      progress: Boolean(this.options.progress),
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Range': `bytes ${this.rangeStart}-${this.rangeEnd}/${this.rangeTotal}`,
        'X-Ipfs-Chunk-Group-Uuid': this.id,
        'X-Ipfs-Chunk-Index': this.index,
        'X-Ipfs-Chunk-Boundary': this.boundary
      }
    }
    return new Promise((resolve, reject) => {
      const progressFn = this.options.progress || noop
      const req = this.send(args, (err, res) => {
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

  request (chunk) {
    const args = {
      path: 'add-chunked',
      qs: this.qs,
      args: this.options.args,
      stream: true,
      recursive: true,
      progress: Boolean(this.options.progress),
      multipart: true,
      multipartBoundary: this.boundary,
      // remove this when daemon supports getting boundary from content-type
      headers: {
        'X-Ipfs-Chunk-Boundary': this.boundary
      }
    }

    const progressFn = this.options.progress || noop
    return this.send(args, (err, res) => {
      if (err) {
        return this.emit('error', err)
      }

      res.on('data', (d) => {
        if (d.path) {
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
