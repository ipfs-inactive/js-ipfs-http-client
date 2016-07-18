var IPFS = require('ipfs-api')
var ipfs = IPFS()

function store () {
  var toStore = document.getElementById('source').value
  //TODO un-break this call:
  ipfs.add(new Buffer(toStore), function (err, res) {
    if(err || !res) return console.error("ipfs add error", err, res)

    res.forEach(function (file) {
      console.log('successfully stored', file.Hash);
      display(file.Hash);
    })
  })
}

function display (hash) {
  ipfs.cat(hash, function (err, stream) {
    if(err || !stream) return console.error("ipfs cat error", err, stream);
    var res = '';

    if(!stream.readable) {
      console.error('unhandled: cat result is a pipe', stream);
    } else {
      stream.on('data', function (chunk) {
        res += chunk.toString();
      })

      stream.on('error', function (err) {
        console.error('Oh nooo', err);
      })

      stream.on('end', function () {
        document.getElementById('hash').innerText = hash;
        document.getElementById('content').innerText = res;
      })
    }
  });
}

document.getElementById('store').onclick=store;
