'use strict'

const SendFilesStream = require('../utils/send-files-stream')
const FileResultStreamConverter = require('../utils/file-result-stream-converter')
const { addReadableStream } = require('./add-experimental')

module.exports = (send) => (options = {}) => {
  if (options.experimental) {
    return addReadableStream(send)(options)
  }
  options.converter = FileResultStreamConverter
  return SendFilesStream(send, 'add')(options)
}
