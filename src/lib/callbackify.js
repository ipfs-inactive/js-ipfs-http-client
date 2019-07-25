'use strict'

module.exports = (fn, opts) => {
  opts = opts || {}
  // Min number of non-callback args
  opts.minArgs = opts.minArgs == null ? 0 : opts.minArgs

  return (...args) => {
    const cb = args[args.length - 1]

    if (typeof cb !== 'function' || args.length === opts.minArgs) {
      return fn(...args)
    }

    fn(...args.slice(0, -1)).then(res => cb(null, res), cb)
  }
}
