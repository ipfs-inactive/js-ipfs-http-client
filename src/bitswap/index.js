'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    ledger: require('./ledger')(send),
    stat: require('./stat')(send),
    unwant: require('./unwant')(send),
    wantlist: require('./wantlist')(send)
  }
}
