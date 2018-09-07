'use strict'

const { Readable } = require('stream')
const toPull = require('stream-to-pull-stream')
const concatStream = require('concat-stream')
const pump = require('pump')
const SendStream = require('./send-stream')

const arrayToStream = (data) => {
  let i = 0
  return new Readable({
    objectMode: true,
    read () {
      this.push(i < data.length ? data[i++] : null)
    }
  })
}

const add = (send) => (files, options) => {
  // check if we can receive pull-stream after callbackify
  let result = []
  return new Promise((resolve, reject) => {
    pump(
      arrayToStream([].concat(files)),
      new SendStream(send, options),
      concatStream(r => (result = r)),
      (err) => {
        if (err) {
          return reject(err)
        }
        resolve(result)
      }
    )
  })
}

const addReadableStream = (send) => (options) => {
  return new SendStream(send, options)
}

const addPullStream = (send) => (options) => {
  return toPull(new SendStream(send, options))
}

module.exports = {
  add,
  addReadableStream,
  addPullStream
}
