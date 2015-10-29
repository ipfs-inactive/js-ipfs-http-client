module.exports = function safeJSONParser (buffer, res, done) {
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
