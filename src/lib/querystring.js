'use strict'

const Qs = require('qs')

// Convert an object to a query string INCLUDING leading ?
// Excludes null/undefined values
exports.objectToQuery = obj => {
  if (!obj) return ''

  const qs = Object.entries(obj).reduce((obj, [key, value]) => {
    if (value != null) obj[key] = value
    return obj
  }, {})

  return Object.keys(qs).length ? `?${Qs.stringify(qs, { arrayFormat: 'repeat' })}` : ''
}
