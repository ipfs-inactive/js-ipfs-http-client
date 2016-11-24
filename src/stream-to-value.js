'use strict'

const concat = require('concat-stream')

/*
  Concatenate a stream to a single value.
*/
function streamToValue (res, callback) {
  res.pipe(concat((data) => callback(null, data)))
}

module.exports = streamToValue
