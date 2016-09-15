/* eslint-env mocha */
/* eslint max-nested-callbacks: ['error', 8] */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const FactoryClient = require('../factory/factory-client')
const map = require('async/map')

const topicName = 'js-ipfs-api-tests'

const publish = (ipfs, data, callback) => {
  ipfs.pubsub.publish(topicName, data, (err, successful) => {
    expect(err).to.not.exist
    expect(successful).to.equal(true)
    callback()
  })
}

describe('.pubsub', () => {
  if (!isNode) {
    return
  }

  let ipfs
  let fc

  before(function (done) {
    fc = new FactoryClient()
    fc.spawnNode((err, node) => {
      expect(err).to.not.exist
      if (err) done(err)
      ipfs = node
      done()
    })
  })

  after((done) => {
    fc.dismantle(done)
  })

  describe('.publish', () => {
    it('message from string', (done) => {
      publish(ipfs, 'hello friend', done)
    })
    it('message from buffer', (done) => {
      publish(ipfs, new Buffer('hello friend'), done)
    })
  })

  describe('.subscribe', () => {
    it('one topic', (done) => {
      const subscription = ipfs.pubsub.subscribe(topicName)
      subscription.on('data', (d) => {
        expect(d.data).to.equal('hi')
        subscription.cancel()
      })
      subscription.on('end', () => {
        done()
      })
      setTimeout(publish.bind(null, ipfs, 'hi', () => {}), 0)
    })
    it('fails when already subscribed', () => {
      const firstSub = ipfs.pubsub.subscribe(topicName)
      let caughtErr = null
      try {
        ipfs.pubsub.subscribe(topicName)
      } catch (err) {
        caughtErr = err
      }
      expect(caughtErr.toString()).to.equal('Error: Already subscribed to ' + topicName)
      firstSub.cancel()
    })
    it('receive multiple messages', (done) => {
      let receivedMessages = []
      let interval = null
      const expectedMessages = 2
      const subscription = ipfs.pubsub.subscribe(topicName)
      subscription.on('data', (d) => {
        receivedMessages.push(d.data)
        if (receivedMessages.length === expectedMessages) {
          receivedMessages.forEach((msg) => {
            expect(msg).to.be.equal('hi')
          })
          clearInterval(interval)
          subscription.cancel()
          done()
        }
      })

      setTimeout(() => {
        interval = setInterval(publish.bind(null, ipfs, 'hi', () => {}), 10)
      }, 10)
    })
  })
  describe('multiple nodes pub/sub', () => {
    let clients = {}
    before(function (done) {
      const keys = ['a', 'b']
      fc = new FactoryClient()
      map(['a', 'b'], (_, cb) => {
        return fc.spawnNode(cb)
      }, (err, nodes) => {
        if (err) return done(err)
        keys.forEach((key, i) => {
          clients[key] = nodes[i]
        })
        done()
      })
    })
    after((done) => {
      fc.dismantle(done)
    })
    it('receive messages from different node', (done) => {
      const expectedString = 'hello from the other side'
      const subscription = clients.a.pubsub.subscribe(topicName)
      subscription.on('data', (d) => {
        expect(d.data).to.be.equal(expectedString)
        subscription.cancel()
        done()
      })
      setTimeout(() => {
        clients.b.pubsub.publish(topicName, expectedString, (err, result) => {
          expect(err).to.not.exist
          expect(result).to.equal(true)
        })
      }, 100)
    })
  })
})
