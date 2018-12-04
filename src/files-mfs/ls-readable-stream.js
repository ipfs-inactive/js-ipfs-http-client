'use strict'

const lsPullStream = require('./ls-pull-stream')
const toStream = require('pull-stream-to-stream')

module.exports = (send) => {
  return (args, opts) => {
    return toStream.source(lsPullStream(send)(args, opts))
  }
}
