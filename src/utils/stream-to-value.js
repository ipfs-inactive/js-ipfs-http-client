'use strict'

const pump = require('pump')
const concat = require('concat-stream')
const once = require('once')

/*
  Concatenate a stream to a single value.
*/
function streamToValue (response, callback) {
  callback = once(callback)

  pump(
    response,
    concat((data) => callback(null, data)),
    (err) => {
      if (err) {
        callback(err)
      }
    })
}

module.exports = streamToValue
