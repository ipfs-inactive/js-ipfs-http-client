/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

describe('.bitswap', function () {
  this.timeout(20 * 1000) // slow CI
  let ipfsd = null

  before((done) => {
    this.timeout(20 * 1000) // slow CI
    df.spawn((err, node) => {
      expect(err).to.not.exist()
      ipfsd = node
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  describe('Callback API', () => {
    it('.wantlist', (done) => {
      ipfsd.api.bitswap.wantlist((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.have.to.be.eql({
          Keys: null
        })
        done()
      })
    })

    it('.stat', (done) => {
      ipfsd.api.bitswap.stat((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.have.property('BlocksReceived')
        expect(res).to.have.property('DupBlksReceived')
        expect(res).to.have.property('DupDataReceived')
        expect(res).to.have.property('Peers')
        expect(res).to.have.property('ProvideBufLen')
        expect(res).to.have.property('Wantlist')

        done()
      })
    })

    it('.unwant', (done) => {
      const key = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
      ipfsd.api.bitswap.unwant(key, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })
  })

  describe('Promise API', () => {
    it('.wantlist', () => {
      return ipfsd.api.bitswap.wantlist()
        .then((res) => {
          expect(res).to.have.to.be.eql({
            Keys: null
          })
        })
    })

    it('.stat', () => {
      return ipfsd.api.bitswap.stat()
        .then((res) => {
          expect(res).to.have.property('BlocksReceived')
          expect(res).to.have.property('DupBlksReceived')
          expect(res).to.have.property('DupDataReceived')
          expect(res).to.have.property('Peers')
          expect(res).to.have.property('ProvideBufLen')
          expect(res).to.have.property('Wantlist')
        })
    })

    it('.unwant', () => {
      const key = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
      return ipfsd.api.bitswap.unwant(key)
    })
  })
})
