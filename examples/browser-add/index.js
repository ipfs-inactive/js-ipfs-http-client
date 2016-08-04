'use strict'

var IPFS = require('ipfs-api')
var ipfs = IPFS()

function store () {
  var toStore = document.getElementById('source').value
  ipfs.add(new Buffer(toStore), function (err, res) {
    if (err || !res) {
      return console.error('ipfs add error', err, res)
    }

    res.forEach(function (file) {
      console.log('successfully stored', file)
      display(file.path)
    })
  })
}

function display (hash) {
  ipfs.cat(hash, function (err, res) {
    if (err || !res) {
      return console.error('ipfs cat error', err, res)
    }
    if (res.readable) {
      console.error('unhandled: cat result is a pipe', res)
    } else {
      document.getElementById('hash').innerText = hash
      document.getElementById('content').innerText = res
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('store').onclick = store
})
