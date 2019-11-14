'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (options) => {
    options = options || {}

    const data = await ky.get('diag/net', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: options.searchParams
    }).json()

    return data
  }
})
