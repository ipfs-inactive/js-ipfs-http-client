'use strict'

const Fs = require('fs')
const Path = require('path')
const glob = require('glob')
const pushable = require('it-pushable')
const errCode = require('err-code')

/**
* Create an AsyncIterable that can be passed to ipfs.add for the
* provided file paths.
*
* @param {String} ...paths File system path(s) to glob from
* @param {Object} [options] Optional options
* @param {Boolean} [options.recursive] Recursively glob all paths in directories
* @param {Boolean} [options.hidden] Include .dot files in matched paths
* @param {Array<String>} [options.ignore] Glob paths to ignore
* @param {Boolean} [options.followSymlinks] follow symlinks
* @returns {AsyncIterable}
*/
module.exports = (...args) => (async function * () {
  const options = typeof args[args.length - 1] === 'string' ? {} : args.pop()
  const paths = args

  const globSourceOptions = {
    recursive: options.recursive,
    glob: {
      dot: Boolean(options.hidden),
      ignore: Array.isArray(options.ignore) ? options.ignore : [],
      follow: options.followSymlinks != null ? options.followSymlinks : true
    }
  }

  // Check the input paths comply with options.recursive and convert to glob sources
  const results = await Promise.all(paths.map(pathAndType))
  const globSources = results.map(r => toGlobSource(r, globSourceOptions))

  for (const globSource of globSources) {
    for await (const { path, contentPath } of globSource) {
      yield { path, content: Fs.createReadStream(contentPath) }
    }
  }
})()

function toGlobSource ({ path, type }, options) {
  return (async function * () {
    options = options || {}

    const baseName = Path.basename(path)

    if (type === 'file') {
      yield { path: baseName, contentPath: path }
      return
    }

    if (type === 'dir' && !options.recursive) {
      throw errCode(
        new Error(`'${path}' is a directory and recursive option not set`),
        'ERR_DIR_NON_RECURSIVE',
        { path }
      )
    }

    const globOptions = Object.assign({}, options.glob, {
      cwd: path,
      nodir: true,
      realpath: false,
      absolute: false
    })

    // TODO: want to use pull-glob but it doesn't have the features...
    const pusher = pushable()

    glob('**/*', globOptions)
      .on('match', m => pusher.push(m))
      .on('end', () => pusher.end())
      .on('abort', () => pusher.end())
      .on('error', err => pusher.end(err))

    for await (const p of pusher) {
      yield {
        path: `${baseName}/${toPosix(p)}`,
        contentPath: Path.join(path, p)
      }
    }
  })()
}

async function pathAndType (path) {
  const stat = await Fs.promises.stat(path)
  return { path, type: stat.isDirectory() ? 'dir' : 'file' }
}

const toPosix = path => path.replace(/\\/g, '/')
