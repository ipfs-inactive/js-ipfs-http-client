'use strict'

const callbackify = require('callbackify')
const moduleConfig = require('../utils/module-config')

module.exports = (arg, config) => {
  const send = moduleConfig(arg)

  return {
    get: require('./get')(send),
    put: callbackify.variadic(require('./put')(config)),
    data: require('./data')(send),
    links: require('./links')(send),
    stat: require('./stat')(send),
    new: require('./new')(send),
    patch: {
      addLink: require('./addLink')(send),
      rmLink: require('./rmLink')(send),
      setData: callbackify.variadic(require('./setData')(config)),
      appendData: callbackify.variadic(require('./appendData')(config))
    }
  }
}
