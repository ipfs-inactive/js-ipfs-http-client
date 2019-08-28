'use strict'
const IpfsHttpClient = require('ipfs-http-client')

async function main () {
  const apiUrlInput = document.getElementById('api-url')
  const nodeConnectBtn = document.getElementById('node-connect')

  const peerAddrInput = document.getElementById('peer-addr')
  const peerConnectBtn = document.getElementById('peer-connect')

  const topicInput = document.getElementById('topic')
  const subscribeBtn = document.getElementById('subscribe')

  const messageInput = document.getElementById('message')
  const sendBtn = document.getElementById('send')

  const consoleEl = document.getElementById('console')

  function log (message) {
    const container = document.createElement('div')
    container.innerHTML = message
    consoleEl.appendChild(container)
    consoleEl.scrollTop = consoleEl.scrollHeight
  }

  function clear () {
    consoleEl.innerHTML = ''
  }

  let topic
  let peerId

  async function nodeConnect (url) {
    clear()
    log(`Connecting to ${url}`)
    window.ipfs = IpfsHttpClient(url)
    const { id, agentVersion } = await window.ipfs.id()
    peerId = id
    log(`<span class="green">Success!</span>`)
    log(`Version ${agentVersion}`)
    log(`Peer ID ${id}`)
  }

  const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

  async function peerConnect (addr) {
    if (!addr) throw new Error('Missing peer multiaddr')
    if (!window.ipfs) throw new Error('Connect to a node first')
    log(`Connecting to peer ${addr}`)
    await window.ipfs.swarm.connect(addr)
    log(`<span class="green">Success!</span>`)
    log('Listing swarm peers...')
    await sleep()
    const peers = await window.ipfs.swarm.peers()
    peers.forEach(peer => {
      const fullAddr = `${peer.addr}/ipfs/${peer.peer.toB58String()}`
      log(`<span class="${addr.endsWith(peer.peer.toB58String()) ? 'teal' : ''}">${fullAddr}</span>`)
    })
    log(`(${peers.length} peers total)`)
  }

  async function subscribe (nextTopic) {
    if (!nextTopic) throw new Error('Missing topic name')
    if (!window.ipfs) throw new Error('Connect to a node first')

    const lastTopic = topic

    if (topic) {
      topic = null
      log(`Unsubscribing from topic ${lastTopic}`)
      await window.ipfs.pubsub.unsubscribe(lastTopic)
    }

    log(`Subscribing to ${nextTopic}...`)

    await window.ipfs.pubsub.subscribe(nextTopic, msg => {
      const from = msg.from
      const seqno = msg.seqno.toString('hex')
      if (from === peerId) return log(`Ignoring message ${seqno} from self`)
      log(`Message ${seqno} from ${from}:`)
      try {
        log(JSON.stringify(msg.data.toString(), null, 2))
      } catch (_) {
        log(msg.data.toString('hex'))
      }
    }, {
      onError: (err, fatal) => {
        if (fatal) {
          console.error(err)
          log(`<span class="red">${err.message}</span>`)
          topic = null
          log('Resubscribing in 5s...')
          setTimeout(catchLog(() => subscribe(nextTopic)), 5000)
        } else {
          console.warn(err)
        }
      }
    })

    topic = nextTopic
    log(`<span class="green">Success!</span>`)
  }

  async function send (msg) {
    if (!msg) throw new Error('Missing message')
    if (!topic) throw new Error('Subscribe to a topic first')
    if (!window.ipfs) throw new Error('Connect to a node first')

    log(`Sending message to ${topic}...`)
    await window.ipfs.pubsub.publish(topic, msg)
    log(`<span class="green">Success!</span>`)
  }

  function catchLog (fn) {
    return async (...args) => {
      try {
        await fn(...args)
      } catch (err) {
        console.error(err)
        log(`<span class="red">${err.message}</span>`)
      }
    }
  }

  const createOnEnterPress = fn => {
    return e => {
      if (event.which == 13 || event.keyCode == 13) {
        e.preventDefault()
        fn()
      }
    }
  }

  const onNodeConnectClick = catchLog(() => nodeConnect(apiUrlInput.value))
  apiUrlInput.addEventListener('keydown', createOnEnterPress(onNodeConnectClick))
  nodeConnectBtn.addEventListener('click', onNodeConnectClick)

  const onPeerConnectClick = catchLog(() => peerConnect(peerAddrInput.value))
  peerAddrInput.addEventListener('keydown', createOnEnterPress(onPeerConnectClick))
  peerConnectBtn.addEventListener('click', onPeerConnectClick)

  const onSubscribeClick = catchLog(() => subscribe(topicInput.value))
  topicInput.addEventListener('keydown', createOnEnterPress(onSubscribeClick))
  subscribeBtn.addEventListener('click', onSubscribeClick)

  const onSendClick = catchLog(async () => {
    await send(messageInput.value)
    messageInput.value = ''
  })
  messageInput.addEventListener('keydown', createOnEnterPress(onSendClick))
  sendBtn.addEventListener('click', onSendClick)
}

main()
