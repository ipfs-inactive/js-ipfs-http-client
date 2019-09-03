'use strict'

const fs = require('fs-extra')
const glob = require('it-glob')
const Path = require('path')
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
* @returns {Iterable} source iterable
*/
module.exports = async function * globSource (...args) {
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
  for (const path of paths) {
    const stat = await fs.stat(path)
    const prefix = Path.dirname(path)
    const type = stat.isDirectory() ? 'dir' : 'file'
    yield * toGlobSource({ path, type, prefix }, globSourceOptions)
  }
}

async function * toGlobSource ({ path, type, prefix }, options) {
  options = options || {}

  const baseName = Path.basename(path)

  if (type === 'file') {
    yield {
      path: baseName,
      content: fs.createReadStream(
        Path.isAbsolute(path) ? path : Path.join(process.cwd(), path)
      )
    }
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

  for await (const p of glob(path, '**/*', globOptions)) {
    yield {
      path: toPosix(Path.join(baseName, p)),
      content: fs.createReadStream(Path.join(path, p))
    }
  }
}

const toPosix = path => path.replace(/\\/g, '/')
