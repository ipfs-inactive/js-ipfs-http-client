/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect
const path = require('path')
const fs = require('fs')
const isNode = require('detect-node')

describe('.add', () => {
  it('adds a buffer', (done) => {
    apiClients.a.add(new Buffer('hello world'), (err, res) => {
      expect(err).to.not.exist
      expect(res[0]).to.have.property('path')
      expect(res[0]).to.have.property('node')
      done()
    })
  })

  it('adds an array', (done) => {
    const buffers = [new Buffer('hello'), new Buffer('world')]

    apiClients.a.add(buffers, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.length(2)
      expect(res[0]).to.have.property('path')
      expect(res[0]).to.have.property('node')
      done()
    })
  })

  it('adds a readable stream', (done) => {
    if (!isNode) return done()

    const f = path.join(__dirname, '../test-folder/files/hello.txt')
    const stream = fs.createReadStream(f)

    apiClients.a.add(stream, (err, res) => {
      expect(err).to.not.exist
      expect(res[0]).to.have.property('path')
      expect(res[0]).to.have.property('node')
      done()
    })
  })

  it('returns an error when adding an unaccepted type', (done) => {
    apiClients.a.add('a string', (err, res) => {
      expect(err).to.be.instanceOf(Error)
      done()
    })
  })
})
