/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const isNode = require('detect-node')
const path = require('path')
const fs = require('fs')

const IPFSApi = require('../src')
const f = require('./utils/factory')

describe('.addFromStream', () => {
  if (!isNode) { return }

  let ipfsd
  let ipfs

  before(function (done) {
    this.timeout(20 * 1000) // slow CI

    f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after(function (done) {
    this.timeout(10 * 1000)
    if (!ipfsd) return done()
    ipfsd.stop(done)
  })

  it('same as .add', (done) => {
    const tfpath = path.join(__dirname, '/fixtures/testfile.txt')
    const rs = fs.createReadStream(tfpath)
    rs.path = '' // clean the path for testing purposes

    ipfs.addFromStream(rs, (err, result) => {
      expect(err).to.not.exist()
      expect(result.length).to.equal(1)
      done()
    })
  })
})
