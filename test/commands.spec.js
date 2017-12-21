/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

describe('.commands', function () {
  this.timeout(20 * 1000)

  let ipfsd

  before((done) => {
    df.spawn((err, node) => {
      expect(err).to.not.exist()
      ipfsd = node
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  it('lists commands', (done) => {
    ipfsd.api.commands((err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      done()
    })
  })

  describe('promise', () => {
    it('lists commands', () => {
      return ipfsd.api.commands()
        .then((res) => {
          expect(res).to.exist()
        })
    })
  })
})
