'use strict'

const SendFilesStream = require('../utils/send-files-stream')
const FileResultStreamConverter = require('../utils/file-result-stream-converter')
const toPull = require('stream-to-pull-stream')
const { addPullStream } = require('./add-experimental')

module.exports = (send) => (options = {}) => {
  if (options.experimental) {
    return addPullStream(send)(options)
  }
  options.converter = FileResultStreamConverter
  return toPull(SendFilesStream(send, 'add')({ qs: options }))
}
