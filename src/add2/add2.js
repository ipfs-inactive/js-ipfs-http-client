'use strict'

const { Readable, Transform } = require('stream')
const isStream = require('is-stream')
const pump = require('pump')
const Multipart = require('./multipart2')
const { prepareWithHeaders } = require('./../utils/prepare-file')

const noop = () => {}

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
    try {
      callback(null, prepareWithHeaders(chunk, options))
    } catch (err) {
      callback(err)
    }
  }
})

module.exports = (send) => (files, options) => {
  const multipart = pump(
    arrayToStream([].concat(files)),
    prepareTransform(options),
    new Multipart(options),
    (err) => {
      if (err) {
        multipart.emit('error', err)
      }
    }
  )

  return sendChunked(multipart, send, options)
}

/**
 *  Send multipart in chunks
 *
 * @param {Multipart} multipartStream
 * @param {function} send
 * @param {Object} options
 * @returns {Promise}
 */
const sendChunked = (multipartStream, send, options) => {
  return new Promise((resolve, reject) => {
    let waiting = null
    const state = {
      boundary: multipartStream._boundary,
      id: uuid(),
      index: 0,
      rangeStart: 0,
      rangeEnd: 0,
      rangeTotal: 0,
      running: false,
      extraBytes: 0,
      totalUp: 0,
      totalAdd: 0
    }

    multipartStream.on('error', reject)
    multipartStream.on('end', () => {
      console.log('End', state.rangeTotal)

      // wait for all chunks to be sent
      // doing all this in the end should simplify future concurrent chunk uploads
      if (state.running && waiting === null) {
        waiting = setInterval(() => {
          if (!state.running) {
            clearInterval(waiting)
            waiting = null
            sendChunkRequest(send, options, null, state)
              .then(resolve)
              .catch(reject)
          }
        }, 100)
      } else {
        sendChunkRequest(send, options, null, state)
          .then(resolve)
          .catch(reject)
      }
    })

    multipartStream.on('data', (chunk) => {
      console.log('Send ', chunk.length)
      // stop producing chunks
      multipartStream.pauseAll()
      state.extraBytes = multipartStream.extraBytes
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
          multipartStream.resumeAll()
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
const sendChunkRequest = (
  send,
  options,
  chunk,
  {
    boundary,
    id,
    index,
    rangeStart,
    rangeEnd,
    rangeTotal,
    extraBytes,
    totalUp,
    totalAdd
  }) => {
  return new Promise((resolve, reject) => {
    const progressFn = options.progress || noop
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
      progress: Boolean(options.progress),
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

      // we are in the last request
      if (isStream(res)) {
        const result = []
        res.on('data', (d) => {
          if (d.path) {
            // files added reporting
            result.push(d)
          } else {
            // progress reporting
            totalAdd = d.Bytes / 2
            progressFn(totalAdd + totalUp)
          }
        })
        res.on('error', reject)
        res.on('end', () => {
          resolve(result)
        })
      } else {
        totalUp = (rangeTotal - extraBytes) / 2
        progressFn(totalUp)
        resolve(res)
      }
    })

    // write and send
    if (chunk !== null) {
      req.write(Buffer.from(chunk))
    }
    req.end()
  })
}
