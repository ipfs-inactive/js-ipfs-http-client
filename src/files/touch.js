'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return function touch (path, mtime, options) {
    options = options || {}

    if (isNaN(mtime)) {
      options = mtime
      mtime = null
    }

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.append('arg', path)
    if (mtime) searchParams.set('mtime', mtime)
    if (options.format) searchParams.set('format', options.format)
    if (options.flush != null) searchParams.set('flush', options.flush)
    if (options.hashAlg) searchParams.set('hash', options.hashAlg)
    if (options.parents != null) searchParams.set('parents', options.parents)

    return ky.post('files/touch', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).text()
  }
})
