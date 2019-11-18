'use strict'

const configure = require('../lib/configure')
const Big = require('bignumber.js')

module.exports = configure(({ ky }) => {
  return async (options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.human) searchParams.set('human', options.human)

    const res = await ky.get('bitswap/stat', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return toCoreInterface(res, options)
  }
})

function toCoreInterface (res, { human }) {
  return {
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
  }
}
