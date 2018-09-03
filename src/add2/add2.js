'use strict'

const { Readable, Transform } = require('stream')
const toStream = require('buffer-to-stream')
const pump = require('pump')
const Multipart = require('./multipart2')
const {prepareWithHeaders} = require('./../utils/prepare-file')

const arrayToStream = (data) => {
  let i = 0
  return new Readable({
    objectMode: true,
    read () {
      this.push(i < data.length ? data[i++] : null)
    }
  })
}

const prepareTransform = (options) => new Transform({
  objectMode: true,
  transform (chunk, encoding, callback) {
    callback(null, prepareWithHeaders(chunk, options))
  }
})

module.exports = (send) => (files, options) => {
  const multipart = new Multipart()

  // add pump
  arrayToStream([].concat(files))
    .pipe(prepareTransform(options))
    .pipe(multipart)

  return sendChunked(multipart, send, options)
}

const sendChunked = (multipartStream, send, options) => {
  return new Promise((resolve, reject) => {
    const boundary = multipartStream._boundary
    let index = 0
    let rangeStart = 0
    let rangeEnd = 0
    let size = 0
    let ended = false
    let running = false
    const name = createName()

    multipartStream.on('end', () => {
      ended = true
      console.log('end', size)

      // if multipart already ended and no request is pending send last request
      if (!running) {
        // sendChunk('', -1, rangeEnd, rangeEnd, name, boundary, size)
        sendChunkRequest(send, options, '', -1, rangeEnd, rangeEnd, name, boundary, size)
          .then(rsp => {
            resolve(rsp)
          })
      }
    })

    multipartStream.on('data', (chunk) => {
      console.log('Sending ', chunk.length)
      multipartStream.pause()
      index++
      rangeEnd = rangeStart + chunk.length
      size += chunk.length
      running = true

      //   sendChunk(chunk, index, rangeStart, rangeEnd, name, boundary)
      sendChunkRequest(send, options, chunk, index, rangeStart, rangeEnd, name, boundary)
        .then(rsp => {
          console.log('Response', rsp)
          rangeStart = rangeEnd
          multipartStream.resume()
          // if multipart already ended send last request
          if (ended) {
            console.log('sending last')
            // sendChunk('', -1, rangeEnd, rangeEnd, name, boundary, size)
            sendChunkRequest(send, options, '', -1, rangeEnd, rangeEnd, name, boundary, size)
              .then(rsp => {
                resolve(rsp)
              })
          }
          running = false
        })
        .catch(reject)
    })
  })
}

const sendChunk = (chunk, id, start, end, name, boundary, size = '*') => {
  const url = new URL('http://localhost')
  const search = new URLSearchParams()
  search.set('stream-channels', true)
  url.port = 5002
  url.pathname = 'api/v0/add-chunked'
  url.search = search

  return window.fetch(url.href, {
    method: 'POST',
    body: chunk,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Ipfs-Chunk-Name': name,
      'Ipfs-Chunk-Id': id,
      'Ipfs-Chunk-Boundary': boundary
    }
  })
    .then(res => res.json())
}

function createName () {
  const date = new Date(Date.now()).toISOString()
  function chr4 () {
    return Math.random().toString(16).slice(-4)
  }
  return date + '--' + chr4() + chr4() +
      '-' + chr4() +
      '-' + chr4() +
      '-' + chr4() +
      '-' + chr4() + chr4() + chr4()
}

const sendChunkRequest = (send, options, chunk, id, start, end, name, boundary, size = '*') => {
  return new Promise((resolve, reject) => {
    const qs = {
      'cid-version': options['cid-version'],
      'raw-leaves': options['raw-leaves'],
      'only-hash': options.onlyHash,
      'wrap-with-directory': options.wrapWithDirectory,
      hash: options.hashAlg || options.hash
    }
    const args = {
      path: 'add-chunked',
      qs: qs,
      args: options.args,
      stream: true,
      //   recursive: true,
      //   progress: options.progress,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Ipfs-Chunk-Name': name,
        'Ipfs-Chunk-Id': id,
        'Ipfs-Chunk-Boundary': boundary
      }
    }

    const req = send(args, (err, res) => {
      if (err) {
        return reject(err)
      }

      resolve(res)
    })

    pump(toStream(chunk), req)
  })
}
