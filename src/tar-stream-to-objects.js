'use strict'

const tar = require('tar-stream')
const ReadableStream = require('readable-stream').Readable
/*
  Transform tar stream into a stream of objects:

  Output format:
  { path: 'string', content: Readable }
*/
class TarStreamToObjects extends ReadableStream {
  constructor (options) {
    const opts = Object.assign(options || {}, { objectMode: true })
    super(opts)
  }

  static from (inputStream, callback) {
    let outputStream = new TarStreamToObjects()

    inputStream
      .pipe(tar.extract())
      .on('entry', (header, stream, next) => {
        stream.on('end', next)

        if (header.type !== 'directory') {
          outputStream.push({
            path: header.name,
            content: stream
          })
        } else {
          outputStream.push({
            path: header.name
          })
          stream.resume()
        }
      })
      .on('finish', () => outputStream.push(null))

    callback(null, outputStream)
  }

  _read () {}
}

module.exports = TarStreamToObjects
