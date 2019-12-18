'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (cid, path, options) => {
    if (typeof path === 'object') {
      options = path
      path = null
    }

    options = options || {}

    const cidPath = path
      ? [cid, path].join(path.startsWith('/') ? '' : '/')
      : `${cid}`

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', cidPath)
    if (options.localResolve) searchParams.set('localResolve', options.localResolve)

    const res = await ky.post('dag/resolve', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return { cid: new CID(res.Cid['/']), remPath: res.RemPath }
  }
})
