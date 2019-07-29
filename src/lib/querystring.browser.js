'use strict'

// Convert an object to a query string INCLUDING leading ?
// Excludes null/undefined values
exports.objectToQuery = obj => {
  if (!obj) return ''

  let qs = Object.entries(obj).forEach(([key, value]) => {
    if (value != null) {
      if (Array.isArray(value)) {
        value.forEach(v => qs.append(key, v))
      } else {
        qs.append(key, value)
      }
    }
  })

  qs = qs.toString()

  return qs ? `?${qs}` : qs
}
