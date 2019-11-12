'use strict'

const callbackify = require('callbackify')

module.exports = (send, config) => {
  return {
    get: callbackify.variadic(require('./get')(config)),
    set: require('./set')(send),
    replace: require('./replace')(send),
    profiles: {
      apply: require('./profiles/apply')(config),
      list: require('./profiles/list')(config)
    }
  }
}
