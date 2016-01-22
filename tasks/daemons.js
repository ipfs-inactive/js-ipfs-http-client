'use strict'

const gulp = require('gulp')
const fs = require('fs')

let daemons

gulp.task('daemons:start', done => {
  startDisposableDaemons(d => {
    daemons = d
    done()
  })
})

gulp.task('daemons:stop', done => {
  stopDisposableDaemons(daemons, () => {
    daemons = null
    done()
  })
})

function startDisposableDaemons (callback) {
  const ipfsd = require('ipfsd-ctl')

  const ipfsNodes = {} // a, b, c
  const apiAddrs = {} // a, b, c

  let counter = 0
  startIndependentNode(ipfsNodes, apiAddrs, 'a', finish)
  startIndependentNode(ipfsNodes, apiAddrs, 'b', finish)
  startIndependentNode(ipfsNodes, apiAddrs, 'c', finish)

  function finish () {
    counter++
    if (counter === 3) {
      fs.writeFileSync(__dirname + '/../test/tmp-disposable-nodes-addrs.json', JSON.stringify(apiAddrs))
      callback(ipfsNodes)
    }
  }

  function startIndependentNode (ipfsNodes, apiAddrs, key, cb) {
    ipfsd.disposable((err, node) => {
      if (err) {
        throw err
      }

      ipfsNodes[key] = node

      console.log('  ipfs init done - (bootstrap and mdns off) - ' + key)

      ipfsNodes[key].setConfig('Bootstrap', null, err => {
        if (err) {
          throw err
        }
        ipfsNodes[key].setConfig('Discovery', '{}', err => {
          if (err) {
            throw err
          }

          const headers = {
            HTTPHeaders: {
              'Access-Control-Allow-Origin': ['*'],
              // TODO: When ipfs/go-ipfs#1979 is merged drop these
              'Access-Control-Allow-Headers': ['X-Stream-Output, X-Chunked-Output'],
              'Access-Control-Expose-Headers': ['X-Stream-Output, X-Chunked-Output']
            }
          }
          ipfsNodes[key].setConfig('API', JSON.stringify(headers), err => {
            if (err) {
              throw err
            }

            ipfsNodes[key].startDaemon((err, daemon) => {
              if (err) {
                throw err
              }
              daemon.add('test/test-folder', {r: true}, (e, r) => {
                if (e) throw e
              })
              apiAddrs[key] = ipfsNodes[key].apiAddr
              cb()
            })
          })
        })
      })
    })
  }
}

function stopDisposableDaemons (daemons, callback) {
  stopIPFSNode(daemons, 'a', finish)
  stopIPFSNode(daemons, 'b', finish)
  stopIPFSNode(daemons, 'c', finish)

  let counter = 0
  function finish () {
    counter++
    if (counter === 3) {
      callback()
    }
  }

  function stopIPFSNode (daemons, key, cb) {
    let nodeStopped
    daemons[key].stopDaemon(err => {
      if (err) {
        throw err
      }
      if (!nodeStopped) {
        nodeStopped = true
        cb()
      }
    })
  }
}
