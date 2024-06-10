# extended-fetch

![NPM Version](https://img.shields.io/npm/v/%40akiyamka%2Fextended-fetch)
![NPM Type Definitions](https://img.shields.io/npm/types/%40akiyamka%2Fextended-fetch)
[![spring-easing's badge](https://deno.bundlejs.com/badge?q=@akiyamka/extended-fetch@0.0.5&treeshake=[*]&config={%22esbuild%22:{%22format%22:%22esm%22}})](https://bundlejs.com/?q=@akiyamka/extended-fetch) [![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm) [![Module type: CJS](https://img.shields.io/badge/module%20type-cjs-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)


**This library allows you to cath Timeout Error without enforcing a time restriction**

🧹 No dependencies  
🤏 Tiny size  
🧩 Does not patching existing fetch  
🔀 In most cases can be used as drop in replacement for fetch  

> ⚠️ It's *not* a fetch polyfill. It uses `Request` and `Response` objects from fetch implementation

## Installation

```sh
npm install @akiyamka/extended-fetch
```

## Usage

Have fetch like api, but with few additional features:

### Catch timeout error

Fetch does not allow the user to know if his request was failed due to a 504 error.  
Instead it throws common `TypeError: Failed to fetch`  
But `extended-fetch` throw 'Timeout Error' error for that case

```js
import extendedFetch, { isTimeoutError } from '@akiyamka/extended-fetch'

extendedFetch('/users', {
  method: 'POST',
  body: JSON.stringify({ foo: 'bar' }),
}).catch((error) => {
  // Allow identify timeout error
  console.assert(error.message, 'Timeout Error')
  console.assert(isTimeoutError(error), true)
})
```

### Subscribe to upload and download events with progress:


```js
import extendedFetch from 'extended-fetch'

extendedFetch(
  '/users',
  // Fetch configuration
  {
    method: 'POST',
    body: JSON.stringify({ foo: 'bar' }),
  },
  // Additional settings
  {
    onUploadProgress: (event) => {
       console.log(`Uploaded: ${event.progress}% (${event.bytes} bytes)`)
    },
    onDownloadProgress: (event) => {
       console.log(`Downloaded: ${event.progress}% (${event.bytes} bytes)`)
    },
  }
)
```

### Catch Abort error

The library has a typed helper for Abort error detection

```ts
import extendedFetch, { isAbortError } from 'extended-fetch'

const abortController = new AbortController()
abortController.abort()
try {
  const reference = await extendedFetch(srv.readyCheck(), {
    signal: abortController.signal,
  })
} catch (err) {
  if (isAbortError(e)) {
    // request was aborted
  }
}
```

## Motivation 

Fetch has a pretty good api but doesn't cover some of the frequent occurrences of what an XHR query can give us

### Fetch and timeout error
Currently, there is no way to determine that the reason the request failed is due to the Timeout Error using the fetch API, but sometimes it needed, for example, for meaningful UI reaction.

[The most popular workaround](https://stackoverflow.com/questions/46946380/fetch-api-request-timeout) for this today is to set a forced limit on the client side, which will only work if it less than the existing limit outside, and it will also break functionality in situations where the limit has been raised above the standard limit

### Fetch and uploading progress

Using fetch we can get *download* progress information [using readable stream](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#consuming_a_fetch_as_a_stream)(if supported), but we still don't have a way to get *upload* progress using fetch api.


### Let's combine fetch api and XHR capabilities
I wrapped XHR in a fetch api (taking some code from the [fetch polyfill](https://github.com/JakeChampion/fetch)) and added the missing functionality available from the XHR api
