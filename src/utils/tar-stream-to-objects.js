'use strict'

const tar = require('it-tar')
const toIterable = require('../lib/stream-to-iterable')

/*
  Transform a tar readable stream into an async iterator of objects:

  Output format:
  { path: 'string', content: AsyncIterator<Buffer> }
*/
async function * tarStreamToObjects (inputStream) {
  const extractor = tar.extract()

  for await (const { header, body } of extractor(toIterable(inputStream))) {
    if (header.type === 'directory') {
      yield {
        path: header.name
      }
    } else {
      yield {
        path: header.name,
        content: (async function * () {
          for await (const chunk of body) {
            yield chunk.slice() // Convert BufferList to Buffer
          }
        })()
      }
    }
  }
}

module.exports = tarStreamToObjects
