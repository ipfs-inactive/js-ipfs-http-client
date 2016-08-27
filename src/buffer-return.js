'use strict'

const toBuffer = require('arraybuffer-to-buffer')

// node-fetch has res.buffer
// window.fetch has res.arrayBuffer
module.exports = function bufferReturn (res) {
  if (res.buffer) {
    return res.buffer()
  } else {
    return res.arrayBuffer().then(toBuffer)
  }
}
