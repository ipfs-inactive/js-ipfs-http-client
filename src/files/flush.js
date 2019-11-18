'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (path, options) => {
    if (typeof path !== 'string') {
      options = path
      path = '/'
    }

    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', path)

    const { Cid } = await ky.post('files/flush', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return new CID(Cid)
  }
})
