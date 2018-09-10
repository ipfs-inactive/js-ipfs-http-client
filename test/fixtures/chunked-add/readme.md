
### Copy/paste this inside inside this folder to test add chunked with curl
Don't forget to start the daemon 
```bash
curl 'http://localhost:5002/api/v0/add-chunked?progress=true&stream-channels=true' -H 'X-Chunked-Input: uuid="28085967-267f-e569-9593-e7fb1ce53b45"; index=1' -H 'Content-Type: multipart/form-data; boundary=----------------------------817904829930564528937953' -H 'Content-Range: bytes 0-1024/1024' -H 'Connection: keep-alive' --data-binary @chunk1 --compressed

curl 'http://localhost:5002/api/v0/add-chunked?progress=true&stream-channels=true' -H 'X-Chunked-Input: uuid="28085967-267f-e569-9593-e7fb1ce53b45"; index=2' -H 'Content-Type: multipart/form-data; boundary=----------------------------817904829930564528937953' -H 'Content-Range: bytes 1024-2048/2048' -H 'Connection: keep-alive' --data-binary @chunk2 --compressed

curl 'http://localhost:5002/api/v0/add-chunked?progress=true&stream-channels=true' -H 'X-Chunked-Input: uuid="28085967-267f-e569-9593-e7fb1ce53b45"; index=3' -H 'Content-Type: multipart/form-data; boundary=----------------------------817904829930564528937953' -H 'Content-Range: bytes 2048-2242/2242' -H 'Connection: keep-alive' --data-binary @chunk3 --compressed

curl 'http://localhost:5002/api/v0/add-chunked?progress=true&stream-channels=true' -X POST -H 'X-Chunked-Input: uuid="28085967-267f-e569-9593-e7fb1ce53b45"; index=3' -H 'Content-Type: multipart/form-data; boundary=--------------------------817904829930564528937953' -H 'Content-Range: bytes 2242-2242/2242' -H 'Accept: */*' -H 'Connection: keep-alive' -H 'Content-Length: 0' --compressed
```