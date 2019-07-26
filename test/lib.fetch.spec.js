/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const throwsAsync = require('./utils/throws-async')

const { ok, toIterable } = require('../src/lib/fetch')

describe('lib/fetch', () => {
  describe('ok', () => {
    it('should parse json error response', async () => {
      const res = {
        ok: false,
        text: () => Promise.resolve(JSON.stringify({
          Message: 'boom',
          Code: 0,
          Type: 'error'
        })),
        status: 500
      }

      const err = await throwsAsync(ok(res))

      expect(err.message).to.eql('boom')
      expect(err.status).to.eql(500)
    })

    it('should gracefully fail on parse json', async () => {
      const res = {
        ok: false,
        text: () => 'boom', // not valid json!
        status: 500
      }

      const err = await throwsAsync(ok(res))

      expect(err.message).to.eql('boom')
      expect(err.status).to.eql(500)
    })

    it('should gracefully fail on read text', async () => {
      const res = {
        ok: false,
        text: () => Promise.reject(new Error('boom')),
        status: 500
      }

      const err = await throwsAsync(ok(res))

      expect(err.message).to.eql('unexpected status 500')
      expect(err.status).to.eql(500)
    })
  })

  describe('toIterable', () => {
    it('should return input if already async iterable', () => {
      const input = { [Symbol.asyncIterator] () { return this } }
      expect(toIterable(input)).to.equal(input)
    })

    it('should convert reader to async iterable', async () => {
      const inputData = [2, 31, 3, 4]
      const input = {
        getReader () {
          let i = 0
          return {
            read: async () => {
              return i === inputData.length
                ? { done: true }
                : { value: inputData[i++] }
            },
            releaseLock: () => {}
          }
        }
      }

      const chunks = []
      for await (const chunk of toIterable(input)) {
        chunks.push(chunk)
      }

      expect(chunks).to.eql(inputData)
    })

    it('should throw on unknown stream', () => {
      expect(() => toIterable({})).to.throw('unknown stream')
    })
  })
})
