/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect
const Readable = require('stream').Readable
const path = require('path')
const isNode = require('detect-node')
const fs = require('fs')
const bs58 = require('bs58')

let testfile
let testfileBig
const testfilePath = path.join(__dirname, '/../testfile.txt')

if (isNode) {
  testfile = fs.readFileSync(testfilePath)
  testfileBig = fs.createReadStream(path.join(__dirname, '/../15mb.random'), { bufferSize: 128 })
  // testfileBig = fs.createReadStream(path.join(__dirname, '/../100mb.random'), { bufferSize: 128 })
} else {
  testfile = require('raw!../testfile.txt')
  // browser goes nuts with a 100mb in memory
  // testfileBig = require('raw!../100mb.random')
}

describe('.add', () => {
  it('add file', (done) => {
    if (!isNode) {
      return done()
    }

    const file = {
      path: 'testfile.txt',
      content: new Buffer(testfile)
    }

    apiClients.a.add([file], (err, res) => {
      expect(err).to.not.exist

      const added = res[0] != null ? res[0] : res
      const mh = bs58.encode(added.multihash()).toString()
      expect(mh).to.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      expect(added.links).to.have.length(0)
      done()
    })
  })

  it('add buffer', (done) => {
    let buf = new Buffer(testfile)
    apiClients.a.add(buf, (err, res) => {
      expect(err).to.not.exist

      expect(res).to.have.length(1)
      const mh = bs58.encode(res[0].multihash()).toString()
      expect(mh).to.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      expect(res[0].links).to.have.length(0)
      done()
    })
  })

  it('add BIG buffer', (done) => {
    if (!isNode) {
      return done()
    }

    apiClients.a.add(testfileBig, (err, res) => {
      expect(err).to.not.exist

      expect(res).to.have.length(1)
      const mh = bs58.encode(res[0].multihash()).toString()
      expect(mh).to.equal('Qmcx5werSWQPdrGVap7LARHB4QUSPRPJwxhFuHvdoXqQXT')
      expect(res[0].links).to.have.length(58)
      done()
    })
  })

  it('add path', (done) => {
    if (!isNode) {
      return done()
    }

    apiClients.a.add(testfilePath, (err, res) => {
      expect(err).to.not.exist

      const added = res[0] != null ? res[0] : res
      const mh = bs58.encode(added.multihash()).toString()
      expect(mh).to.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      expect(added.links).to.have.length(0)
      done()
    })
  })

  it('add a nested dir following symlinks', (done) => {
    apiClients.a.add(path.join(__dirname, '/../test-folder'), { recursive: true }, (err, res) => {
      if (isNode) {
        expect(err).to.not.exist

        const added = res[res.length - 1]
        const mh = bs58.encode(added.multihash()).toString()
        expect(mh).to.equal('QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6')
        expect(added.links).to.have.length(7)

        done()
      } else {
        expect(err.message).to.be.equal('Recursive uploads are not supported in the browser')
        done()
      }
    })
  })

  it('add a nested dir without following symlinks', (done) => {
    apiClients.a.add(path.join(__dirname, '/../test-folder'), { recursive: true, followSymlinks: false }, (err, res) => {
      if (isNode) {
        expect(err).to.not.exist

        const added = res[res.length - 1]
        // same hash as the result from the cli (ipfs add test/test-folder -r)
        const mh = bs58.encode(added.multihash()).toString()
        expect(mh).to.equal('QmRArDYd8Rk7Zb7K2699KqmQM1uUoejn1chtEAcqkvjzGg')
        expect(added.links).to.have.length(7)
        done()
      } else {
        expect(err.message).to.be.equal('Recursive uploads are not supported in the browser')
        done()
      }
    })
  })

  it('add a nested dir as array', (done) => {
    if (!isNode) return done()
    const fs = require('fs')
    const base = path.join(__dirname, '../test-folder')
    const content = (name) => ({
      path: `test-folder/${name}`,
      content: fs.readFileSync(path.join(base, name))
    })
    const dirs = [
      content('add.js'),
      content('cat.js'),
      content('ls.js'),
      content('ipfs-add.js'),
      content('version.js'),
      content('files/hello.txt'),
      content('files/ipfs.txt'),
      {
        path: 'test-folder',
        dir: true
      }
    ]

    apiClients.a.add(dirs, { recursive: true }, (err, res) => {
      expect(err).to.not.exist

      const added = res[res.length - 1]
      const mh = bs58.encode(added.multihash()).toString()
      expect(mh).to.equal('QmTDH2RXGn8XyDAo9YyfbZAUXwL1FCr44YJCN9HBZmL9Gj')
      expect(added.links).to.have.length(6)
      done()
    })
  })

  it('add stream', (done) => {
    const stream = new Readable()
    stream.push('Hello world')
    stream.push(null)

    apiClients.a.add(stream, (err, res) => {
      expect(err).to.not.exist

      const added = res[0] != null ? res[0] : res
      const mh = bs58.encode(added.multihash()).toString()
      expect(mh).to.equal('QmNRCQWfgze6AbBCaT1rkrkV5tJ2aP4oTNPb5JZcXYywve')
      expect(added.links).to.have.length(0)
      done()
    })
  })

  it('add url', (done) => {
    const url = 'https://raw.githubusercontent.com/ipfs/js-ipfs-api/2a9cc63d7427353f2145af6b1a768a69e67c0588/README.md'
    apiClients.a.add(url, (err, res) => {
      expect(err).to.not.exist

      const added = res[0] != null ? res[0] : res
      const mh = bs58.encode(added.multihash()).toString()
      expect(mh).to.equal('QmRzvSX35JpzQ2Lyn55r3YwWqdVP6PPxYHFpiWpwQTff8A')
      expect(added.links).to.have.length(0)
      done()
    })
  })

  describe('promise', () => {
    it('add buffer', () => {
      let buf = new Buffer(testfile)
      return apiClients.a.add(buf)
        .then((res) => {
          const added = res[0] != null ? res[0] : res
          const mh = bs58.encode(added.multihash()).toString()
          expect(mh).to.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
          expect(added.links).to.have.length(0)
        })
    })
  })
})
