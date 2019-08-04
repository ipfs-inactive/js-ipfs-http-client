'use strict'

const { Buffer } = require('buffer')

// Buffer|ArrayBuffer|TypedArray
module.exports = function isBytes (obj) {
  return Buffer.isBuffer(obj) || ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer
}
