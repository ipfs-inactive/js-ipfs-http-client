'use strict'

describe('ls', function () {
  it('should correctly retrieve links', function (done) {
    apiClients['a'].ls('QmTDH2RXGn8XyDAo9YyfbZAUXwL1FCr44YJCN9HBZmL9Gj', (err, res) => {
      if (err === null && res !== undefined) {
        assert(res.Objects[0].Links[0])
        done()
      }
    })
  })
  it('should correctly handle a nonexisting hash', function (done) {
    apiClients['a'].ls('surelynotavalidhashheh?', (err, res) => {
      if (err !== null && res === undefined) {
        done()
      }
    })
  })
  it('should correctly handle a nonexisting path', function (done) {
    apiClients['a'].ls('QmTDH2RXGn8XyDAo9YyfbZAUXwL1FCr44YJCN9HBZmL9Gj/folder_that_isnt_there', (err, res) => {
      if (err !== null && res === undefined) {
        done()
      }
    })
  })
})
