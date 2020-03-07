'use strict'

const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const raw = require('ipld-raw')
const configure = require('../lib/configure')

const resolvers = {
  'dag-cbor': dagCBOR.resolver,
  'dag-pb': dagPB.resolver,
  raw: raw.resolver
}

module.exports = config => {
  const getBlock = require('../block/get')(config)
  const dagResolve = require('./resolve')(config)

  return configure(({ ky }) => {
    return async (cid, path, options) => {
      if (typeof path === 'object') {
        options = path
        path = null
      }

      options = options || {}

      const resolved = await dagResolve(cid, path, options)

      // TODO: delete this comment
      // Return like this to be consistent with what core dag/get is returning
      if (options.localResolve) {
        return {
          value: resolved.cid,
          remainderPath: resolved.remPath
        }
      }

      const block = await getBlock(resolved.cid, options)
      const dagResolver = resolvers[block.cid.codec]

      if (!dagResolver) {
        throw Object.assign(
          new Error(`Missing IPLD format "${block.cid.codec}"`),
          { missingMulticodec: cid.codec }
        )
      }

      return dagResolver.resolve(block.data, resolved.remPath)
    }
  })(config)
}
