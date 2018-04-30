/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSApi = require('../src')

const f = require('./utils/factory')

describe('.commands', function () {
  this.timeout(60 * 1000)

  let ipfsd
  let ipfs

  before((done) => {
    f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  it('lists commands', (done) => {
    ipfs.commands((err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      done()
    })
  })

  describe('promise', () => {
    it('lists commands', () => {
      return ipfs.commands()
        .then((res) => {
          expect(res).to.exist()
        })
    })
  })
})
