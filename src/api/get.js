'use strict'

module.exports = (send) => {
  return function get (path, archive, compress, compressionLevel, cb) {
    if (archive === true && typeof compress === 'function') {
      cb = compress
      compressionLevel = null
      compress = null
    }
    if (archive === true && typeof compress === 'number') {
      archive = null
      cb = compressionLevel
      compressionLevel = compress
      compress = true
    }
    if (typeof archive === 'function') {
      cb = archive
      archive = null
      compressionLevel = null
      compress = null
    }
    return send('get', path, [archive, compress, compressionLevel], null, cb)
  }
}
