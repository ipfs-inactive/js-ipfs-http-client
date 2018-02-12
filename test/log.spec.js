/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSApi = require('../src')
const f = require('./utils/factory')

describe('.log', function () {
  this.timeout(100 * 1000)

  let ipfsd
  let ipfs

  before((done) => {
    f.spawn((err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  it('.log.tail', (done) => {
    const req = ipfs.log.tail((err, res) => {
      expect(err).to.not.exist()
      expect(req).to.exist()

      res.once('data', (obj) => {
        expect(obj).to.be.an('object')
        done()
      })
    })
  })

  it('.log.ls', (done) => {
    ipfs.log.ls((err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()

      expect(res).to.be.an('array')

      done()
    })
  })

  it('.log.level', (done) => {
    ipfs.log.level('all', 'error', (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()

      expect(res).to.be.an('object')
      expect(res).to.not.have.property('Error')
      expect(res).to.have.property('Message')

      done()
    })
  })
})
