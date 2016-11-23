'use strict'

class PubsubMessage {
  constructor (senderId, data, seqNo, topics) {
    this._senderId = senderId
    this._data = data
    this._seqNo = seqNo
    this._topics = topics
  }

  get from () {
    return this._senderId
  }

  get data () {
    return this._data
  }

  get seqno () {
    return this._seqNo
  }

  get topicIDs () {
    return this._topics
  }
}

module.exports = PubsubMessage
