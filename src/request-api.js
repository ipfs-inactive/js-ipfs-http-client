var request = require('superagent')
var logger = require('superagent-logger')

var config = require('./config')

exports = module.exports = requestAPI

function safeJSONParser (buffer, res, done) {
  var headers = !!res.headers
  var stream = headers && !!res.headers['x-stream-output']
  var chunkedObjects = headers && !!res.headers['x-chunked-output']

  // No need to parse
  if (stream && !buffer) return done()
  if (chunkedObjects && buffer) return done()

  var objects = []
  var data = ''
  res.text = ''
  res.setEncoding('utf8')

  res.on('data', function (chunk) {
    res.text += chunk

    if (!chunkedObjects) {
      data += chunk
      return
    }

    try {
      var obj = JSON.parse(chunk.toString())
      objects.push(obj)
    } catch (e) {
      chunkedObjects = false
      data += chunk
    }
  })

  res.on('end', function () {
    var parsed

    if (!chunkedObjects) {
      try {
        parsed = JSON.parse(data)
        data = parsed
      } catch (e) {}
    } else {
      data = objects
    }

    return done(null, data)
  })
}

function prepareFiles (files) {
  files = Array.isArray(files) ? files : [files]

  return files.map(function (file) {
    if (Buffer.isBuffer(file)) {
      // Multipart requests require a filename to not
      // trow, but if it's a buffer we don't know the name
      return {
        contents: file,
        opts: {filename: ''}
      }
    }

    // Just a file path
    return {contents: file}
  })
}

function requestAPI (path, args, opts, files, buffer, cb) {
  if (Array.isArray(path)) path = path.join('/')

  opts = opts || {}

  if (args && !Array.isArray(args)) args = [args]
  if (args) opts.arg = args

  if (typeof buffer === 'function') {
    cb = buffer
    buffer = false
  }

  // this option is only used internally, not passed to daemon
  delete opts.followSymlinks

  opts['stream-channels'] = true

  var method = files ? 'POST' : 'GET'
  var reqPath = config['api-path'] + path
  var url = config.host + ':' + config.port + reqPath

  var req = request(method, url)
    .use(logger)
    .set('User-Agent', config['user-agent'])
    .query(opts)
    .buffer(buffer)
    .parse(safeJSONParser.bind(null, buffer))
    .on('error', cb)
    .on('response', handle)

  if (files) {
    prepareFiles(files).forEach(function (file) {
      req.attach('file', file.contents, file.opts)
    })
  }

  req.end()

  function handle (res) {
    if (res.error) return cb(res.error, null)

    var headers = !!res.headers
    var stream = headers && !!res.headers['x-stream-output']
    var chunkedObjects = headers && !!res.headers['x-chunked-output']

    if (stream && !buffer) return cb(null, res)
    if (chunkedObjects && buffer) return cb(null, res)

    return cb(null, res.body)
  }

  return req
}
