'use strict'

const toCamel = require('./object-to-camel')

function toCamelWithMode (entry) {
  const file = toCamel(entry)

  if (Object.prototype.hasOwnProperty.call(file, 'mode')) {
    file.mode = parseInt(file.mode, 8)
  }

  return file
}

module.exports = toCamelWithMode
