'use strict'

const kyDefault = require('ky-universal').default
const configure = require('./lib/configure')
const toIterable = require('./lib/stream-to-iterable')

module.exports = configure(({ ky }) => {
  const add = require('./add')({ ky })

  return (url, options) => (async function * () {
    options = options || {}

    const { body } = await kyDefault.get(url)

    const input = {
      path: decodeURIComponent(new URL(url).pathname.split('/').pop() || ''),
      content: toIterable(body)
    }

    yield * add(input, options)
  })()
})
