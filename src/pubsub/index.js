'use strict'

const callbackify = require('../lib/callbackify')

// This file is temporary and for compatibility with legacy usage
module.exports = (send, options) => {
  if (typeof send !== 'function') {
    options = send
  }

  return {
    ls: callbackify(require('./ls')(options)),
    peers: callbackify(require('./peers')(options)),
    publish: callbackify(require('./publish')(options)),
    subscribe: callbackify(require('./subscribe')(options), { minArgs: 2 }),
    unsubscribe: callbackify(require('./unsubscribe')(options), { minArgs: 2 })
  }
}
