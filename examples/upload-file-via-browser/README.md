# Upload file to BTFS via browser using js-btfs-http-client

> In this example, you will find a simple React app to upload a file to BTFS via the browser using js-btfs-http-client and Webpack.

## Setup

As for any js-btfs-http-client example, **you need a running BTFS daemon**, you learn how to do that here:

- [Spawn a go-btfs daemon](https://ipfs.io/docs/getting-started/)
- [Spawn a js-ipfs daemon](https://github.com/ipfs/js-ipfs#usage)

**Note:** If you load your app from a different domain than the one the daemon is running (most probably), you will need to set up CORS, see https://github.com/ipfs/js-ipfs-http-client#cors to learn how to do that.

A quick (and dirty way to get it done) is:

```bash
> btfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"*\"]"
> btfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
```

## Run this example

Once the daemon is on, run the following commands within this folder:

```bash
> npm install
> npm start
```

Now open your browser at `http://localhost:3000`

After uploading a file (left screen), and opening the uploaded file (right screen), you should see something like:

> ![App Screenshot](https://github.com/TRON-US/js-btfs-http-client/raw/master/examples/upload-file-via-browser/screenshot.png)
