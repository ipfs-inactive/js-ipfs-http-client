'use strict'
const CID = require('cids')
const errCode = require('err-code')
const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const raw = require('ipld-raw')
const configure = require('../lib/configure')

const resolvers = {
  'dag-cbor': dagCBOR.resolver,
  'dag-pb': dagPB.resolver,
  raw: raw.resolver
}

// TODO this function needs to be extracted and re-used by ipfs-http-client and ipfs
function parseArgs (cid, path, options) {
  options = options || {}

  // Allow options in path position
  if (path !== undefined && typeof path !== 'string') {
    options = path
    path = undefined
  }

  if (typeof cid === 'string') {
    if (cid.startsWith('/ipfs/')) {
      cid = cid.substring(6)
    }

    const split = cid.split('/')

    try {
      cid = new CID(split[0])
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }

    split.shift()

    if (split.length > 0) {
      path = split.join('/')
    } else {
      path = path || '/'
    }
  } else if (Buffer.isBuffer(cid)) {
    try {
      cid = new CID(cid)
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }
  }

  return [
    cid,
    path,
    options
  ]
}

module.exports = config => {
  const getBlock = require('../block/get')(config)
  const dagResolve = require('./resolve')(config)

  return configure(({ ky }) => {
    return async (cid, path, options) => {
      [cid, path, options] = parseArgs(cid, path, options)

      const resolved = await dagResolve(cid, path, options)
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
