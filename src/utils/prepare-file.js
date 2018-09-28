'use strict'

const errcode = require('err-code')
const { isSource } = require('is-pull-stream')
const isStream = require('is-stream')
const flatmap = require('flatmap')
const fileReaderStream = require('filereader-stream')

const isBrowser = typeof window === 'object' &&
    typeof document === 'object' &&
    document.nodeType === 9

function prepareFile (file, opts) {
  let files = [].concat(file)

  return flatmap(files, (file) => {
    return prepare(file, opts)
  })
}

function prepare (file, opts) {
  const result = {
    path: '',
    symlink: false,
    dir: false,
    content: null
  }
  // probably it should be valid and would be handled below with Buffer.from
  if (typeof file === 'string') {
    throw errcode(new Error('String isn\'t valid as an input'), 'ERR_INVALID_INPUT')
  }

  // needs to test for stream because fs.createReadStream has path prop and would handle here
  if (!isStream(file) && file.path && !file.content) { // {path, content} input with no content so we assume directory
    result.dir = true
  } else if (file.content || file.dir) { // {path, content} input with content or dir just copy
    result.content = file.content
    result.dir = file.dir
  } else if (isBrowser && file instanceof self.File) { // browser File input we create a stream from it
    result.path = file.name
    result.content = fileReaderStream(file, opts)
  } else if (!isStream(file) && !isSource(file) && !Buffer.isBuffer(file)) { // if not pull-stream, stream or buffer try to create a buffer from input
    result.content = Buffer.from(file)
  } else { // here we only have pull-stream, stream or buffer so we just set content to input
    result.content = file
  }

  return result
}

function prepareWithHeaders (file, opts) {
  const obj = prepare(file, opts)

  obj.headers = headers(obj)
  return obj
}

function headers (file) {
  const name = file.path
    ? encodeURIComponent(file.path)
    : ''

  const header = { 'Content-Disposition': `file; filename="${name}"` }

  if (!file.content) {
    header['Content-Type'] = 'application/x-directory'
  } else if (file.symlink) {
    header['Content-Type'] = 'application/symlink'
  } else {
    header['Content-Type'] = 'application/octet-stream'
  }

  return header
}

module.exports = {
  prepareFile,
  prepare,
  prepareWithHeaders
}
