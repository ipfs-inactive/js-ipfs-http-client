'use strict'
/* eslint-env browser */

// Blob|File
module.exports = function isBloby (obj) {
  return typeof Blob !== 'undefined' && obj instanceof Blob
}
