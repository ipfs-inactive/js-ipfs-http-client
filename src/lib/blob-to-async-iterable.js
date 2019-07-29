'use strict'
/* eslint-env browser */

// Convert a Blob into an AsyncIterable<ArrayBuffer>
module.exports = (blob, options) => (async function * () {
  options = options || {}

  const reader = new FileReader()
  const chunkSize = options.chunkSize || 1024 * 1024
  let offset = options.offset || 0

  const getNextChunk = () => new Promise((resolve, reject) => {
    reader.onloadend = e => {
      const data = e.target.result
      resolve(data.byteLength === 0 ? null : data)
    }
    reader.onerror = reject

    const end = offset + chunkSize
    const slice = blob.slice(offset, end)
    reader.readAsArrayBuffer(slice)
    offset = end
  })

  while (true) {
    const data = await getNextChunk()
    if (data == null) return
    yield data
  }
})()
