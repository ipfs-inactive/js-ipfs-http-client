'use strict'

const { Readable, Transform } = require('stream')
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
  const multipart = pump(
    arrayToStream([].concat(files)),
    prepareTransform(options),
    new Multipart(options),
    (err) => {
      if (err) {
        // probably better to create a rejected Promise to return
        console.error(err)
      }
    }
  )

  return sendChunked(multipart, send, options)
}

const sendChunked = (multipartStream, send, options) => {
  return new Promise((resolve, reject) => {
    const state = {
      boundary: multipartStream._boundary,
      id: uuid(),
      index: 0,
      rangeStart: 0,
      rangeEnd: 0,
      rangeTotal: 0,
      ended: false,
      running: false
    }

    multipartStream.on('error', reject)
    multipartStream.on('end', () => {
      state.ended = true
      console.log('end', state.rangeTotal)

      // multipart ended and no request is running send last request
      if (!state.running) {
        sendChunkRequest(send, options, '', state)
          .then(resolve)
          .catch(reject)
      }
    })

    multipartStream.on('data', (chunk) => {
      console.log('Sending ', chunk.length)
      // stop producing chunks
      multipartStream.pause()
      state.index++
      state.rangeEnd = state.rangeStart + chunk.length
      state.rangeTotal += chunk.length
      state.running = true

      sendChunkRequest(send, options, chunk, state)
        .then(rsp => {
          console.log('Response', rsp)
          state.running = false
          state.rangeStart = state.rangeEnd
          // resume producing chunks
          multipartStream.resume()

          // if multipart already ended send last request
          if (state.ended) {
            return sendChunkRequest(send, options, '', state)
              .then(resolve)
          }
        })
        .catch(reject)
    })
  })
}

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

/**
 * Send http request
 *
 * @param {function} send
 * @param {Object} options - http request options
 * @param {Uint8Array} chunk - chunk to send
 * @param {Object} {id, start, end, name, boundary, size = '*'} - uploading session state
 * @returns {Promise}
 */
const sendChunkRequest = (send, options, chunk, { boundary, id, index, rangeStart, rangeEnd, rangeTotal = '*' }) => {
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
      recursive: true,
      progress: options.progress,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Range': `bytes ${rangeStart}-${rangeEnd}/${rangeTotal}`,
        'X-Ipfs-Chunk-Group-Uuid': id,
        'X-Ipfs-Chunk-Index': index,
        'X-Ipfs-Chunk-Boundary': boundary
      }
    }

    const req = send(args, (err, res) => {
      if (err) {
        return reject(err)
      }
      resolve(res)
    })

    // write and send
    req.write(Buffer.from(chunk))
    req.end()
  })
}
