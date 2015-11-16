'use strict'

const request = require('request')
const getFilesStream = require('./get-files-stream')
const stream = require('stream')

const isNode = !global.window

// -- Internal

function onEnd (buffer, result, passThrough, cb) {
  return (err, res, body) => {
    if (err) {
      return cb(err)
    }

    if (res.statusCode >= 400 || !res.statusCode) {
      var error = new Error(`Server responded with ${res.statuscode}: ${body}`)
      try {
        body = JSON.parse(body)
        error.code = body.Code
        error.message = body.Message
      } catch (e) {
        error.body = body
      }
      return cb(error)
    }

    if (result.stream) {
      cb(null, passThrough)
      passThrough.resume()
      passThrough.end()
      return
    }

    if ((result.stream && !buffer) ||
        (result.chunkedObjects && buffer)) {
      return cb(null, body)
    }

    if (result.chunkedObjects) return cb(null, result.objects)

    try {
      const parsedBody = JSON.parse(body)
      cb(null, parsedBody)
    } catch (e) {
      cb(null, body)
    }
  }
}

function onData (result, passThrough) {
  return chunk => {
    if (result.stream) {
      passThrough.write(chunk)
      return
    }
    if (!result.chunkedObjects) return

    try {
      const obj = JSON.parse(chunk.toString())
      result.objects.push(obj)
    } catch (e) {
      result.chunkedObjects = false
    }
  }
}

function onResponse (result) {
  return res => {
    result.stream = !!res.headers['x-stream-output']
    result.chunkedObjects = !!res.headers['x-chunked-output']
  }
}

function makeRequest (opts, buffer, cb) {
  // this option is only used internally, not passed to daemon
  delete opts.qs.followSymlinks

  const result = {
    stream: false,
    chunkedObjects: false,
    objects: []
  }

  var passThrough = new stream.PassThrough()

  return request(opts, onEnd(buffer, result, passThrough, cb))
    .on('data', onData(result, passThrough))
    .on('response', onResponse(result))
}

function requestAPI (config, path, args, qs, files, buffer, cb) {
  qs = qs || {}
  if (Array.isArray(path)) path = path.join('/')
  if (args && !Array.isArray(args)) args = [args]
  if (args) qs.arg = args
  if (files && !Array.isArray(files)) files = [files]

  if (typeof buffer === 'function') {
    cb = buffer
    buffer = false
  }

  if (qs.r) {
    qs.recursive = qs.r
    delete qs.r // From IPFS 0.4.0, it throw an error when both r and recursive are passed
  }

  if (!isNode && qs.recursive && path === 'add') {
    return cb(new Error('Recursive uploads are not supported in the browser'))
  }

  qs['stream-channels'] = true

  const opts = {
    method: files ? 'POST' : 'GET',
    protocol: 'http:',
    uri: `http://${config.host}:${config.port}${config['api-path']}${path}`,
    qs: qs,
    useQuerystring: true,
    headers: {},
    withCredentials: false,
    gzip: true
  }

  if (isNode) {
    // Browsers do not allow you to modify the user agent
    opts.headers['User-Agent'] = config['user-agent']
  }

  if (files) {
    const stream = getFilesStream(files, qs)
    if (!stream.boundary) {
      return cb(new Error('No boundary in multipart stream'))
    }

    opts.headers['Content-Type'] = `multipart/form-data; boundary=${stream.boundary}`
    stream.pipe(makeRequest(opts, buffer, cb))
  } else {
    makeRequest(opts, buffer, cb)
  }
}

// -- Interface

exports = module.exports = function getRequestAPI (config) {
  return requestAPI.bind(null, config)
}
