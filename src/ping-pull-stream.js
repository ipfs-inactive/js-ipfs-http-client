'use strict'

const toPull = require('stream-to-pull-stream')
const deferred = require('pull-defer')
const pull = require('pull-stream')
const log = require('pull-stream/sinks/log')
const moduleConfig = require('./utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return (id, opts = {}) => {
    // Default number of packtes to 1
    if (!opts.n && !opts.count) {
      opts.n = 1
    }
    const request = {
      path: 'ping',
      args: id,
      qs: opts
		}
		const p = deferred.source()

		send(request, (err, stream) => {
			if (err) { return p.end(err)  }
      p.resolve(toPull.source(stream))
		})

		return p
	}
}
