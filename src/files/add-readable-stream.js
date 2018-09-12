'use strict'

const SendFilesStream = require('../utils/send-files-stream')
const FileResultStreamConverter = require('../utils/file-result-stream-converter')

module.exports = (send) => (options = {}) => {
  if (options.experimental) {
    return require('./add-experimental').addReadableStream(send)(options)
  }
  options.converter = FileResultStreamConverter
  return SendFilesStream(send, 'add')(options)
}
