/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSApi = require('../src')

const DaemonFactory = require('ipfsd-ctl')

describe('.repo', function () {
  this.timeout(50 * 1000) // slow CI

  let ipfs
  let ipfsd

  before((done) => {
    const df = DaemonFactory.create({remote: true, port: 30003})

    df.spawn((err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  it('.repo.gc', (done) => {
    ipfs.repo.gc((err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      done()
    })
  })

  it('.repo.stat', (done) => {
    ipfs.repo.stat((err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      expect(res).to.have.a.property('numObjects')
      expect(res).to.have.a.property('repoSize')
      done()
    })
  })

  it('.repo.version', (done) => {
    ipfs.repo.version((err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      done()
    })
  })
})
