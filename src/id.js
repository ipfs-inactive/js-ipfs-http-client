'use strict'

const promisify = require('promisify-es6')
const moduleConfig = require('./utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return promisify((opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = undefined
    }
    send({
      path: 'id',
      args: opts
    }, (err, result) => {
      if (err) {
        return callback(err)
      }
      const identity = {
        id: result.ID,
        publicKey: result.PublicKey,
        addresses: result.Addresses,
        agentVersion: result.AgentVersion,
        protocolVersion: result.ProtocolVersion
      }
      callback(null, identity)
    })
  })
}
