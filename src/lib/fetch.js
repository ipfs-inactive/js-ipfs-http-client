'use strict'

const explain = require('explain-error')

exports.fetch = require('node-fetch')

// Ensure fetch response is ok (200)
// and if not, attempt to JSON parse body, extract error message and throw
exports.ok = async res => {
  res = await res

  if (!res.ok) {
    const { status } = res
    const defaultMsg = `unexpected status ${status}`
    let msg
    try {
      let data = await res.text()
      try {
        data = JSON.parse(data)
        msg = data.message || data.Message
      } catch (err) {
        msg = data
      }
    } catch (err) {
      throw Object.assign(explain(err, defaultMsg), { status })
    }
    throw Object.assign(new Error(msg || defaultMsg), { status })
  }

  return res
}

exports.toIterable = body => {
  if (body[Symbol.asyncIterator]) return body

  if (body.getReader) {
    return (async function * () {
      const reader = body.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) return
          yield value
        }
      } finally {
        reader.releaseLock()
      }
    })()
  }

  throw new Error('unknown stream')
}
