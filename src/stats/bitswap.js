'use strict'

const promisify = require('promisify-es6')
const Big = require('bignumber.js')

const transform = ({ human }) => (res, callback) => {
  callback(null, {
    provideBufLen: human
      ? res.ProvideBufLen
      : new Big(res.ProvideBufLen),
    wantlist: res.Wantlist || [],
    peers: res.Peers || [],
    blocksReceived: human
      ? res.BlocksReceived
      : new Big(res.BlocksReceived),
    dataReceived: human
      ? res.DataReceived
      : new Big(res.DataReceived),
    blocksSent: human
      ? res.BlocksSent
      : new Big(res.BlocksSent),
    dataSent: human
      ? res.DataSent
      : new Big(res.DataSent),
    dupBlksReceived: human
      ? res.DupBlksReceived
      : new Big(res.DupBlksReceived),
    dupDataReceived: human
      ? res.DupDataReceived
      : new Big(res.DupDataReceived)
  })
}

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'stats/bitswap',
      qs: opts
    }, transform(opts), callback)
  })
}
