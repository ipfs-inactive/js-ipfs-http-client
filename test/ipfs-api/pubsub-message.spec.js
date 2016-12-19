/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const PubsubMessageUtils = require('../../src/pubsub-message-utils')

const topicName = 'js-ipfs-api-tests'

describe('.pubsub-message', () => {
  it('deserialize message from JSON object', () => {
    const obj = {
      from: 'BI:ۛv�m�uyѱ����tU�+��#���V',
      data: 'aGk=',
      seqno: 'FIlj2BpyEgI=',
      topicIDs: [ topicName ]
    }

    const message = PubsubMessageUtils.deserialize(obj)
    expect(message.from).to.equal('AAA')
    expect(message.data).to.equal('hi')
    expect(message.seqno).to.equal('\u0014�c�\u001ar\u0012\u0002')
    expect(message.topicIDs.length).to.equal(1)
    expect(message.topicIDs[0]).to.equal(topicName)
  })
})
