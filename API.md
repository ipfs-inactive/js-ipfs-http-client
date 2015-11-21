

<a name="IpfsAPI"></a>
## IpfsAPI
**Kind**: global class  

* [IpfsAPI](#IpfsAPI)
  * [new IpfsAPI(host_or_multiaddr, port)](#new_IpfsAPI_new)
  * [.add(files, opts, cb)](#IpfsAPI+add)

<a name="new_IpfsAPI_new"></a>
### new IpfsAPI(host_or_multiaddr, port)
Create a ipfs api


| Param | Type |
| --- | --- |
| host_or_multiaddr | <code>string</code> | 
| port | <code>number</code> | 

<a name="IpfsAPI+add"></a>
### ipfsAPI.add(files, opts, cb)
Add a file/many files to IPFS returning the hash and name. The
name value will only be set if you are actually sending a file.

**Kind**: instance method of <code>[IpfsAPI](#IpfsAPI)</code>  
**Access:** public  

| Param | Type |
| --- | --- |
| files |  | 
| opts | <code>object</code> | 
| cb | <code>function</code> | 


