'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async options => {
    options = options || {}

    const res = await ky.get('log/ls', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: options.searchParams
    }).json()

    return res.Strings
  }
})
