'use strict'

const CID = require('cids')
const explain = require('explain-error')

// Parse an `input` as an IPFS path and return an object of it's component parts.
//
// `input` can be:
//
// `String`
//   * an IPFS path like `/ipfs/Qmf1JJkBEk7nSdYZJqumJVREE1bMZS7uMm6DQFxRxWShwD/file.txt`
//   * an IPNS path like `/ipns/yourdomain.name/file.txt`
//   * a CID like `Qmf1JJkBEk7nSdYZJqumJVREE1bMZS7uMm6DQFxRxWShwD`
//   * a CID and path like `Qmf1JJkBEk7nSdYZJqumJVREE1bMZS7uMm6DQFxRxWShwD/file.txt`
// `CID` - a CID instance
// `Buffer` - a Buffer CID
//
// The return value is an object with the following properties:
//
// * `cid: CID` - the content identifier
// * `path: String` - the path component of the dweb path (the bit after the cid)
module.exports = (input) => {
  let cid, path

  if (Buffer.isBuffer(input) || CID.isCID(input)) {
    try {
      cid = new CID(input)
    } catch (err) {
      throw explain(err, 'invalid CID')
    }

    path = ''
  } else if (Object.prototype.toString.call(input) === '[object String]') {
    // Ensure leading slash
    if (input[0] !== '/') {
      input = `/${input}`
    }

    // Remove trailing slash
    if (input[input.length - 1] === '/') {
      input = input.slice(0, -1)
    }

    const parts = input.split('/')

    if (parts[1] === 'ipfs') {
      try {
        cid = new CID(parts[2])
      } catch (err) {
        throw explain(err, `invalid CID: ${parts[2]}`)
      }

      path = parts.slice(3).join('/')
    } else {
      // Is parts[1] a CID?
      try {
        cid = new CID(parts[1])
      } catch (err) {
        throw new Error(`unknown namespace: ${parts[1]}`)
      }

      path = parts.slice(2).join('/')
    }

    // Ensure leading slash on non empty path
    if (path.length) {
      path = `/${path}`
    }
  } else {
    throw new Error('invalid path') // What even is this?
  }

  return { cid, path }
}
