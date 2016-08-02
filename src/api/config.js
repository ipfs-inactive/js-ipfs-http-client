'use strict'

module.exports = (send) => {
  return {
    get: (key, callback) => {
      if (typeof key === 'function') {
        callback = key
        key = undefined
      }

      if (!key) {
        return send('config/show', null, null, null, true, callback)
      }

      return send('config', key, null, null, callback)
    },
    set (key, value, opts, cb) {
      if (typeof (opts) === 'function') {
        cb = opts
        opts = {}
      }

      if (typeof (value) === 'object') {
        value = JSON.stringify(value)
        opts = { json: true }
      } else if (typeof (value) === 'boolean') {
        value = value.toString()
        opts = { bool: true }
      }

      return send('config', [key, value], opts, null, cb)
    },
    replace (file, cb) {
      return send('config/replace', null, null, file, cb)
    }
  }
}
