/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
const sinon = require('sinon')
chai.use(dirtyChai)

const { PassThrough } = require('stream')

describe('utils', () => {
  describe('stream-to-value', () => {
    const streamToValue = require('../src/utils/stream-to-value')

    it('should only call back once', (done) => {
      const spy = sinon.spy()
      const response = new PassThrough()
      response.write(Buffer.from('some data'))

      streamToValue(response, spy)

      response.end()
      response.emit('error', new Error('something went wrong'))
      expect(spy.calledOnce).to.equal(true)
      done()
    })
  })
})
