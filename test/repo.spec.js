/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

describe('.repo', function () {
  this.timeout(50 * 1000) // slow CI

  let ipfsd

  before((done) => {
    df.spawn((err, node) => {
      expect(err).to.not.exist()
      ipfsd = node
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  describe('Callback API', () => {
    it('.repo.gc', (done) => {
      ipfsd.api.repo.gc((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        done()
      })
    })

    it('.repo.stat', (done) => {
      ipfsd.api.repo.stat((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.a.property('NumObjects')
        expect(res).to.have.a.property('RepoSize')
        done()
      })
    })
  })

  describe('Promise API', () => {
    it('.repo.gc', () => {
      return ipfsd.api.repo.gc().then((res) => expect(res).to.exist())
    })

    it('.repo.stat', () => {
      return ipfsd.api.repo.stat()
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.have.a.property('NumObjects')
          expect(res).to.have.a.property('RepoSize')
        })
    })
  })
})
