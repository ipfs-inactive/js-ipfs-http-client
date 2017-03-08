/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const FactoryClient = require('./ipfs-factory/client')

const ipfsAPI = require('../src/index.js')

function clientWorks (client, done) {
  client.id((err, id) => {
    expect(err).to.not.exist

    expect(id).to.have.a.property('id')
    expect(id).to.have.a.property('publicKey')
    done()
  })
}

describe('ipfs-api constructor tests', () => {
  describe('parameter permuations', () => {
    let fc
    let apiAddr
    let host
    let port

    before(function (done) {
      this.timeout(20 * 1000) // slow CI
      fc = new FactoryClient()
      fc.spawnNode((err, node) => {
        expect(err).to.not.exist
        expect(node.apiAddr).to.exist
        apiAddr = node.apiAddr
        host = apiAddr.nodeAddress().address
        port = apiAddr.nodeAddress().port
        done()
      })
    })

    after((done) => fc.dismantle(done))

    it('opts', (done) => {
      clientWorks(ipfsAPI({
        host: host,
        port: port,
        protocol: 'http'
      }), done)
    })

    it('mutliaddr, opts', (done) => {
      clientWorks(ipfsAPI(apiAddr, { protocol: 'http' }), done)
    })

    it('multiaddr (string), opts', (done) => {
      clientWorks(ipfsAPI(apiAddr.toString(), { protocol: 'http' }), done)
    })

    it('host, port', (done) => {
      clientWorks(ipfsAPI(host, port), done)
    })

    it('host, port, opts', (done) => {
      clientWorks(ipfsAPI(host, port, { protocol: 'http' }), done)
    })
  })
})
