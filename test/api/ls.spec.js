'use strict'

describe('ls', function () {
  it('should correctly retrieve links', function (done) {
    this.timeout(5000)
    apiClients['a'].ls('QmTDH2RXGn8XyDAo9YyfbZAUXwL1FCr44YJCN9HBZmL9Gj', (err, res) => {
      if (err) {
        throw err
      } else done()
    })
  })
  it('should correctly throw errors', function (done) {
    apiClients['a'].ls('surelynotavalidhashheh?', (err, res) => {
      if (err === undefined) {
        throw new Error()
      } else done()
    })
  })
})
