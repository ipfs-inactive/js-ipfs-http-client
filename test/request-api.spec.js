/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const isNode = require('detect-node')
const ipfsAPI = require('../src/index.js')
const async = require('async')

describe('\'deal with HTTP weirdness\' tests', () => {
  it('does not crash if no content-type header is provided', (done) => {
    if (!isNode) { return done() }

    // go-ipfs always (currently) adds a content-type header, even if no content is present,
    // the standard behaviour for an http-api is to omit this header if no content is present
    const server = require('http').createServer((req, res) => {
      res.writeHead(200)
      res.end()
    })

    server.listen(6001, () => {
      ipfsAPI('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json', (err) => {
        expect(err).to.not.exist()
        server.close(done)
      })
    })
  })
})

describe('client cert options', function () {
  it('accepts client cert, key', function (done) {
    // not sure how to automate client certs in browsers
    if (!isNode) { return done() }

    async.waterfall([
      (cb) => {
        require('pem').createCertificate({selfSigned: true}, cb)
      },
      (serverPEM, cb) => {
        require('pem').createCertificate({
          serviceKey: serverPEM.clientKey,
          serviceCertificate: serverPEM.certificate,
          commonName: 'test'
        }, (err, clientPEM) => cb(err, serverPEM, clientPEM))
      },
      (serverPEM, clientPEM, cb) => {
        const server = require('https').createServer({
          requestCert: true,
          rejectUnauthorized: true,
          ca: [serverPEM.certificate],
          key: serverPEM.clientKey,
          cert: serverPEM.certificate
        }, (req, res) => {
          res.end()
        })

        server.listen(6001, () => {
          const ipfs = ipfsAPI({
            host: 'localhost',
            port: '6001',
            protocol: 'https',
            key: clientPEM.clientKey,
            cert: clientPEM.certificate,
            ca: [serverPEM.certificate]
          })

          ipfs.id((err, res) => {
            expect(err).to.not.exist()
            server.close(cb)
          })
        })
      }
    ], done)
  })
})
