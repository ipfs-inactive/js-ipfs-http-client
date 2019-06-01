'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    get: require('./get')(send),
    put: require('./put')(send),
    rm: require('./rm')(send),
    stat: require('./stat')(send)
  }
}
