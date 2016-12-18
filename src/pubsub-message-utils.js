'use strict'

const Base58 = require('bs58')
const Base64 = require('js-base64').Base64
const PubsubMessage = require('./pubsub-message')

class PubsubMessageUtils {
  static create (senderId, data, seqNo, topics) {
    return new PubsubMessage(senderId, data, seqNo, topics)
  }

  static deserialize (data, enc = 'json') {
    enc = enc ? enc.toLowerCase() : null

    if (enc === 'json') {
      return PubsubMessageUtils._deserializeFromJson(data)
    } else if (enc === 'base64') {
      return PubsubMessageUtils._deserializeFromBase64(data)
    }

    throw new Error(`Unsupported encoding: '${enc}'`)
  }

  static _deserializeFromJson (data) {
    const json = JSON.parse(data)
    return PubsubMessageUtils._deserializeFromBase64(json)
  }

  static _deserializeFromBase64 (obj) {
    if (!PubsubMessageUtils._isPubsubMessage(obj)) {
      throw new Error(`Not a pubsub message`)
    }

    const senderId = Base58.encode(obj.from)
    const payload = Base64.decode(obj.data)
    const seqno = Base64.decode(obj.seqno)
    const topics = obj.topicIDs || obj.topicCIDs

    return PubsubMessageUtils.create(senderId, payload, seqno, topics)
  }

  static _isPubsubMessage (obj) {
    return obj && obj.from && obj.seqno && obj.data && (obj.topicIDs || obj.topicCIDs)
  }
}

module.exports = PubsubMessageUtils
