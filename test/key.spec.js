/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

describe('.key', function () {
  this.timeout(50 * 1000)

  let ipfsd
  let ipfs

  before((done) => {
    df.spawn((err, node) => {
      expect(err).to.not.exist()
      ipfsd = node
      ipfs = node.api
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  describe('Callback API', () => {
    describe('.gen', () => {
      it('create a new rsa key', (done) => {
        ipfs.key.gen('foobarsa', { type: 'rsa', size: 2048 }, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          done()
        })
      })

      it('create a new ed25519 key', (done) => {
        ipfs.key.gen('bazed', { type: 'ed25519' }, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          done()
        })
      })
    })

    describe('.list', () => {
      it('both keys show up + self', (done) => {
        ipfs.key.list((err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res.length).to.equal(3)
          done()
        })
      })
    })
  })

  describe('Promise API', () => {
    describe('.gen', () => {
      it('create a new rsa key', () => {
        return ipfs.key.gen('foobarsa2', {type: 'rsa', size: 2048}).then((res) => {
          expect(res).to.exist()
        })
      })

      it('create a new ed25519 key', () => {
        return ipfs.key.gen('bazed2', {type: 'ed25519'}).then((res) => {
          expect(res).to.exist()
        })
      })
    })

    describe('.list', () => {
      it('4 keys to show up + self', () => {
        return ipfs.key.list().then((res) => {
          expect(res).to.exist()
          expect(res.length).to.equal(5)
        })
      })
    })
  })
})
