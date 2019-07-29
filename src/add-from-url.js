'use strict'

const configure = require('./lib/configure')
const { ok, toIterable } = require('./lib/fetch')

module.exports = configure(({ fetch, apiAddr, apiPath, headers }) => {
  const add = require('./add')({ fetch, apiAddr, apiPath, headers })

  return (url, options) => (async function * () {
    options = options || {}
    const res = await ok(fetch(url, {
      signal: options.signal,
      headers: options.headers || headers
    }))

    const input = {
      path: decodeURIComponent(new URL(url).pathname.split('/').pop() || ''),
      content: toIterable(res.body)
    }

    for await (const file of add(input, options)) {
      yield file
    }
  })()
})
