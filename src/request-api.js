var request = require('superagent')
var logger = require('superagent-logger')

var safeJSONParser = require('./json-parser')
var getFilesStream = require('./get-files-stream')

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

  opts['stream-channels'] = true

  var method = files ? 'POST' : 'GET'
  var reqPath = config['api-path'] + path
  var url = config.host + ':' + config.port + reqPath

  var req = request(method, url)
    .set('User-Agent', config['user-agent'])
    .query(opts)
    .buffer(buffer)
    .parse(safeJSONParser.bind(null, buffer))
    .on('error', cb)
    .on('response', handle)

  if (process.env.DEBUG) {
    req.use(logger)
  }

  req.req.on('socket', socket => {
    console.log('got socket')
    socket.on('data', chunk => console.log(chunk.toString()))
  })

  if (files) {
    var stream = getFilesStream(files, opts)
    stream.pipe(req)



  } else {
    req.end()
  }

  function handle (res) {
    if (res.error) return cb(res.error, null)

    var headers = !!res.headers
    var stream = headers && !!res.headers['x-stream-output']
    var chunkedObjects = headers && !!res.headers['x-chunked-output']

    if (stream && !buffer) return cb(null, res)
    if (chunkedObjects && buffer) return cb(null, res)

    return cb(null, res.body)
  }
}

exports = module.exports = function getRequestAPI (config) {
  return requestAPI.bind(null, config)
}
