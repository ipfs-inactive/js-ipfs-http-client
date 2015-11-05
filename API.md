# js-ipfs-api

## API Reference

- [add](#add)
- [cat](#cat)
- [ls](#ls)
- [ID](#id)
- [version](#version)
- [commands](#commands)
- [ping](#ping)
- [config](#config)
- [update](#update)
- [diag](#diag)
- [block](#block)
- [object](#object)
- [swarm](#swarm)
- [pin](#pin)
- [gateway](#gateway)
- [log](#log-1)
- [name](#name)
- [dht](#dht)

## add
`ipfs_client.add(file/files, callback)`

`ipfs_client.add(file/files, options, callback)`

Add a file/many files to IPFS returning the hash and name. The
name value will only be set if you are actually sending a file.

**Usage**

```javascript
ipfs_client.add(files, function(err, res) {
    if(err || !res) return throw new Error(err)

    res.forEach(function(file) {
        console.log(file);
    });
});
```

`files` can be a mixed array of filenames or buffers of data and also a single value.

```javascript
var files = ["../files/hello.txt", new Buffer("IPFS!"), 'IPFS!'];
var files = "../files/hello.txt";
```

As a second parameter, you can also set options like recursive

`TODO: Add all available options`

```javascript
ipfs_client.add(files, {recursive: true}, callback)
```

## cat
`ipfs_client.cat(hash/hashes, callback)`

`ipfs_client.cat(hash/hashes, options, callback)`

Retrieve the contents of a single, or array of hashes

`TODO: update this example because .cat should only return string OR stream always`

**Usage**

```javascript
ipfs_client.cat(hashes, function(err, res) {
    if(err || !res) throw new Error(err)

    if(res.readable) {
        // Returned as a stream
        res.pipe(process.stdout);
    } else {
        // Returned as a string
        console.log(res);
    }
});
```

Hashes can be a string containing the hash or an array of strings.

```
var hashes = "QmahiUEctp3JYevAuS6Uwid4mudd6yD8M6aszpQ5nvVHSt"
var hashes = [
  "QmahiUEctp3JYevAuS6Uwid4mudd6yD8M6aszpQ5nvVHSt",
  "QmWCSGzec5txqWS9o8DVsBMgYNn3pGMrjbwsgwfPuh2DWL"
]
```

## ls
`ipfs_client.ls(hash/hashes, callback)`

`ipfs_client.ls(hash/hashes, options, callback)`

Get the node structure of a hash, included in it is a hash and array to links.

**Usage**

```javascript
ipfs_client.ls(hashes, function(err, res) {
    if(err || !res) return console.error(err)

    res.Objects.forEach(function(node) {
        console.log(node.Hash)
        console.log("Links [%d]", node.Links.length)
        node.Links.forEach(function(link, i) {
            console.log("[%d]", i, link)
        })
    })
})
```

## ID
`ipfs_client.id(callback) // Returns your ID`

`ipfs_client.id(id, callback) // Returns another peers ID`

Prints out information about the specified peer, if no peer is specified, prints out local peers info.

**Usage**

```javascript
ipfs_client.id(function(err, res) {
  if(err || !res) throw new Error(err)

  console.log(res);
  /* =>
  { ID: 'QmWuZGboBP9fpoFvFZ1H9mEKcor5Uz8vk76eib9ssvCpvw',
     PublicKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCzVZOuuwTPnQhK0Lh1hXGoLRC8+maz158X2NgtJtr8qVnHM/ytO8nDsPaAGl6DxKkueO1zPWWBtHYfnJ0CQb1/l28yuf4FTD8mafTQyAgDLcfMruUAp8rYGgK5lkmpjGE1OUel9Wuib52Bb896aCf97+RSdHDD3kj3fV5RS5yl9+PLG8XtEyXQSIVn0dX/zQAIh2DANWL6bGIcKHJR+AfemCV9v343MwoLeA+ypY5dm+zwPTxwuCxCVQO4UWEMSs0NKr51n+xDeVmGluoyX33YciIBv35tqhrkHdEPeMBcZx4NNdhQkz0ATpkAMTu0+x9bogB9YrLAuTKeRXuAK14PAgMBAAE=',
     Addresses:
      [ '/ip6/::1/tcp/4001/ipfs/',
        '/ip4/127.0.0.1/tcp/4001/ipfs/',
        '/ip4/192.168.1.129/tcp/4001/ipfs/',
        '/ip4/37.133.29.50/tcp/4001/ipfs/',
        '/ip4/37.133.29.50/tcp/41530/ipfs/' ],
     AgentVersion: 'go-ipfs/0.3.8-dev',
     ProtocolVersion: 'ipfs/0.1.0' }
     */
})
```

## version
`ipfs_client.version(callback)`

Returns the current version of the connected daemon.

**Usage**

```javascript
  ipfs_client.version(function(err, res) {
    if(err || !res) throw new Error(err)
    console.log(res)
    //  ->{ Version: '0.3.10-dev', Commit: '' }
  })
```

## commands
`ipfs_client.commands()`

Lists all available commands (and subcommands).

## ping
`ipfs_client.ping()`

IPFS ping is a tool to test sending data to other nodes. It finds nodes via the routing system, send pings, wait for pongs, and print out round-trip latency information

## config

IPFS config controls configuration variables.

### get
`ipfs_client.config.get`

Get a value from a config key

### set
`ipfs_client.config.set`

Set a value of a config key

### show
`ipfs_client.config.show`

Show a value from a config key

### replace
`ipfs_client.config.replace`

Replace a config key with new value

## update

**(Disabled)**

**(IPFS update is disabled until we can deploy the binaries to you over IPFS itself)**

### apply
`ipfs_client.update.apply`

**(Disabled)**

### check
`ipfs_client.update.check`

**(Disabled)**

### log
`ipfs_client.update.log`

**(Disabled)**

## diag

### net
`ipfs_client.diag.net`

Sends out a message to each node in the network recursively requesting a listing of data about them including number of connected peers and latencies between them.

## block

### get
`ipfs_client.block.get`

Get a raw IPFS block

### put
`ipfs_client.block.put`

Stores input as an IPFS block

## object

### get
`ipfs_client.object.get`

Get and serialize the DAG node named by <key>

### put
`ipfs_client.object.put`

Stores input as a DAG object, outputs its key

### data
`ipfs_client.object.data`

Outputs the raw bytes in an IPFS object

### stat
`ipfs_client.object.stat`

Get stats for the DAG node named by <key>

### links
`ipfs_client.object.links`

Get stats for the DAG node named by <key>

## swarm

### peers
`ipfs_client.swarm.peers`

Outputs the links pointed to by the specified object

### connect
`ipfs_client.swarm.connect`

Open connection to a given address

## pin

### add
`ipfs_client.pin.add`

Pins objects to local storage

### remove
`ipfs_client.pin.remove`

Removes (unpin) objects from local storage

### list
`ipfs_client.pin.list`

Lists all objects currently in local storage

## gateway

`(TODO)`

### enable
`ipfs_client.gateway.enable`
### disable
`ipfs_client.gateway.disable`

## log

### tail
`ipfs_client.log.tail`

Read the logs

## name

### publish
`ipfs_client.name.publish`

Publish an object to IPNS

### resolve
`ipfs_client.name.resolve`

Gets the value currently published at an IPNS name

## dht

### findprovs
`ipfs_client.dht.findprovs`

Run a 'FindProviders' query through the DHT

### get
`ipfs_client.dht.get`

Run a 'GetValue' query through the DHT

### put
`ipfs_client.dht.put`

Run a 'PutValue' query through the DHT