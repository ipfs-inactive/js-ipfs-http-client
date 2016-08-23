/* globals fetch:false */
'use strict'

const Qs = require('qs')
const toReadStream = require('streamifier').createReadStream
const isNode = require('detect-node')
const bl = require('bl')
const toArrayBuffer = require('to-arraybuffer')

const getFilesStream = require('./get-files-stream')
const bufferReturn = require('./buffer-return')

// -- Internal

function onRes (buffer) {
  return (res) => {
    const stream = Boolean(res.headers.get('x-stream-output'))
    const chunkedObjects = Boolean(res.headers.get('x-chunked-output'))
    const isJson = res.headers.has('content-type') &&
                   res.headers.get('content-type').indexOf('application/json') === 0

    if (!res.ok) {
      const error = new Error(`Server responded with ${res.statusCode}`)

      return res.json()
        .then((payload) => {
          if (payload) {
            error.code = payload.Code
            error.message = payload.Message || payload.toString()
          }

          throw error
        })
    }

    if (stream && !buffer) {
      return bufferReturn(res).then(toReadStream)
    }

    if (chunkedObjects) {
      if (!isJson) {
        return bufferReturn(res)
      }

      return bufferReturn(res)
        .then((raw) => {
          const parts = raw.toString().split('\n').filter(Boolean)
          try {
            return parts
              .map(JSON.parse)
          } catch (err) {
            console.error(parts)
            console.error(err.stack)
            throw err
          }
        })
    }

    // Can't use res.json() as it throws on empty responses
    return res.text().then((raw) => {
      if (raw) {
        return JSON.parse(raw)
      }
    })
  }
}

function requestAPI (config, options) {
  options.qs = options.qs || {}

  if (Array.isArray(options.files)) {
    options.qs.recursive = true
  }

  if (Array.isArray(options.path)) {
    options.path = options.path.join('/')
  }
  if (options.args && !Array.isArray(options.args)) {
    options.args = [options.args]
  }
  if (options.args) {
    options.qs.arg = options.args
  }
  if (options.files && !Array.isArray(options.files)) {
    options.files = [options.files]
  }

  if (options.qs.r) {
    options.qs.recursive = options.qs.r
    // From IPFS 0.4.0, it throws an error when both r and recursive are passed
    delete options.qs.r
  }

  options.qs['stream-channels'] = true

  let stream
  if (options.files) {
    stream = getFilesStream(options.files, options.qs)
  }

  // this option is only used internally, not passed to daemon
  delete options.qs.followSymlinks

  const port = config.port ? `:${config.port}` : ''

  const opts = {
    method: 'POST',
    uri: `${config.protocol}://${config.host}${port}${config['api-path']}${options.path}?${Qs.stringify(options.qs, {arrayFormat: 'repeat'})}`,
    headers: {}
  }

  if (isNode) {
    // Browsers do not allow you to modify the user agent
    opts.headers['User-Agent'] = config['user-agent']
  }

  if (options.files) {
    if (!stream.boundary) {
      return Promise.reject(new Error('No boundary in multipart stream'))
    }

    opts.headers['Content-Type'] = `multipart/form-data; boundary=${stream.boundary}`
    opts.body = stream
  }

  return Promise.resolve(opts.body)
    .then((body) => {
      if (!body || !body.pipe || isNode) return body

      return new Promise((resolve, reject) => {
        body.pipe(bl((err, buf) => {
          if (err) return reject(err)
          resolve(toArrayBuffer(buf))
        }))
      })
    })
    .then((body) => fetch(opts.uri, {
      headers: opts.headers,
      method: opts.method,
      mode: 'cors',
      body: body
    }))
    .then(onRes(options.buffer))
}

//
// -- Module Interface

exports = module.exports = function getRequestAPI (config) {
  /*
   * options: {
   *   path:   // API path (like /add or /config) - type: string
   *   args:   // Arguments to the command - type: object
   *   qs:     // Opts as query string opts to the command --something - type: object
   *   files:  // files to be sent - type: string, buffer or array of strings or buffers
   *   buffer: // buffer the request before sending it - type: bool
   * }
   */
  const send = function (options, callback) {
    if (typeof options !== 'object') {
      return callback(new Error('no options were passed'))
    }

    return requestAPI(config, options)
      .then((res) => callback(null, res))
      .catch((err) => callback(err))
  }

  // Wraps the 'send' function such that an asynchronous
  // transform may be applied to its result before
  // passing it on to either its callback or promise.
  send.withTransform = function (transform) {
    return function (options, callback) {
      if (typeof options !== 'object') {
        return callback(new Error('no options were passed'))
      }

      send(options, wrap(callback))

      function wrap (func) {
        if (func) {
          return function (err, res) {
            transform(err, res, send, func)
          }
        }
      }
    }
  }

  return send
}
