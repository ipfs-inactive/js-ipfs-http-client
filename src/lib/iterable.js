'use strict'

const toPull = require('async-iterator-to-pull-stream')
const toStream = require('it-to-stream')

exports.collectify = fn => async (...args) => {
  const items = []
  for await (const item of fn(...args)) items.push(item)
  return items
}

exports.pullify = {
  source: fn => (...args) => toPull(fn(...args)),
  transform: fn => (...args) => toPull.transform(source => fn(source, ...args))
}

exports.streamify = {
  transform: fn => (...args) => toStream.transform(source => fn(source, ...args), { objectMode: true })
}
