var request = require('superagent')

var safeJSONParser = require('./json-parser')
var getFilesStream = require('./get-files-stream')

var isNode = !global.window

function requestAPI (config, path, args, opts, files, buffer, cb) {
  opts = opts || {}
  if (Array.isArray(path)) path = path.join('/')
  if (args && !Array.isArray(args)) args = [args]
  if (args) opts.arg = args

  if (typeof buffer === 'function') {
    cb = buffer
    buffer = false
  }

  // this option is only used internally, not passed to daemon
  delete opts.followSymlinks

  var method = files ? 'POST' : 'GET'
  var url = `${config.host}:${config.port}${config['api-path']}${path}`

  var req = request(method, url)
    .set('User-Agent', config['user-agent'])
    .query(opts)
    .query('stream-channels')
    .parse(safeJSONParser.bind(null, buffer))
    .on('error', cb)
    .on('response', res => {
      if (res.error) return cb(res.error)

      var headers = !!res.headers
      var stream = headers && !!res.headers['x-stream-output']
      var chunkedObjects = headers && !!res.headers['x-chunked-output']

      if (stream && !buffer) return cb(null, res)
      if (chunkedObjects && buffer) return cb(null, res)

      return cb(null, res.body)
    })

  // Superagent does not support buffering on the client side
  if (isNode) {
    req.buffer(buffer)
  }

  if (files) {
    var stream = getFilesStream(files, opts)
    if (!stream.boundary) {
      return cb(new Error('no boundary in multipart stream'))
    }
    req.set('Content-Type', 'multipart/form-data; boundary=' + stream.boundary)
    stream.pipe(req)
  } else {
    req.end()
  }
}

module.exports = function getRequestAPI (config) {
  return requestAPI.bind(null, config)
}
