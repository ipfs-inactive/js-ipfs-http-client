'use strict'

const configure = require('../lib/configure')
const globSource = require('./glob-source')

module.exports = configure(({ ky }) => {
  const add = require('../add')({ ky })
  return (path, options) => add(globSource(path, options), options)
})
