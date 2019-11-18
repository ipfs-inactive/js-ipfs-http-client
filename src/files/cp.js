'use strict'

const configure = require('../lib/configure')
const { findSources } = require('./utils')

module.exports = configure(({ ky }) => {
  return (...args) => {
    const { sources, options } = findSources(args)

    const searchParams = new URLSearchParams(options.searchParams)
    sources.forEach(src => searchParams.append('arg', src))
    if (options.format) searchParams.set('format', options.format)
    if (options.flush != null) searchParams.set('flush', options.flush)
    if (options.hashAlg) searchParams.set('hash', options.hashAlg)
    if (options.parents != null) searchParams.set('parents', options.parents)

    return ky.post('files/cp', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).text()
  }
})
