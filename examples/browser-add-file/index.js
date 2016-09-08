/* globals FileReader */
'use strict'

var ipfs = window.IpfsApi()

function storeText () {
  store(document.getElementById('source').value)
}

function storeFile () {
  const file = document.getElementById('filePicker').files[0]
  const reader = new FileReader()
  reader.onload = function () {
    store(reader.result)
  }
  reader.readAsArrayBuffer(file)
}

// from examples/browser-add
function store (toStore) {
  ipfs.add(new window.buffer.Buffer(toStore), function (err, res) {
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

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('storeText').onclick = storeText
  document.getElementById('storeBuffer').onclick = storeFile
})
