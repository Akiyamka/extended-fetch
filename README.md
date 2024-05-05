# extended-fetch
![NPM Version](https://img.shields.io/npm/v/%40akiyamka%2Fextended-fetch)
![NPM Type Definitions](https://img.shields.io/npm/types/%40akiyamka%2Fextended-fetch)
[![spring-easing's badge](https://deno.bundlejs.com/badge?q=@akiyamka/extended-fetch@0.0.5&treeshake=[*]&config={%22esbuild%22:{%22format%22:%22esm%22}})](https://bundlejs.com/?q=@akiyamka/extended-fetch) [![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm) [![Module type: CJS](https://img.shields.io/badge/module%20type-cjs-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)  

Currently, there is no way to determine that the reason the request failed is due to the Timeout Error using the fetch API, but sometimes it needed, for example, for meaningful UI reaction.

[The most popular workaround](https://stackoverflow.com/questions/46946380/fetch-api-request-timeout) for this today is to set a forced limit on the client side, which will only work if it less than the existing limit outside, and it will also break functionality in situations where the limit has been raised above the standard limit

**This library allows you to cath Timeout Error without enforcing a time restriction**

🤏 Tiny size
🧩 Does not patching existing fetch, just exports own implementation  
🔀 Can be used as drop in replacement for fetch  
> ⚠️ It's not a fetch polyfill. It uses `Request` and `Response` objects from fetch implementation

## Installation
```sh
npm install @akiyamka/extended-fetch
```

## Usage

Works just like native fetch, but with few additional features:

### Catch timeout error

Fetch does not allow the user to know if his request was failed due to a 504 error.  
Instead it throws common `TypeError: Failed to fetch`  
But `extended-fetch` throw 'Timeout Error' error for that case

```js
import { fetch, isTimeoutError } from 'extended-fetch';

fetch('/users', {
  method: 'POST',
  body: JSON.stringify({ foo: 'bar' }),
}).catch((error) => {
  // Allow identify timeout error
  console.assert(error.message, 'Timeout Error');
  console.assert(isTimeoutError(error), true);
});
```

### Subscribe to xhr events:

Also you can hook XMLHttpRequest events:

- [loadstart](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/loadstart_event)
- [load](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/load_event)
- [loadend](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/loadend_event)
- [progress](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/progress_event)
- [error](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/error_event)
- [abort](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/abort_event)

```js
import { fetch } from 'extended-fetch';

fetch(
  '/users',
  {
    method: 'POST',
    body: JSON.stringify({ foo: 'bar' }),
  },
  {
    // Extra setting
    eventListener: (event) => {
      if (event.type === 'progress') {
        console.log(`Progress changed to ${event.payload}`);
      }
    },
  }
)
```
### Catch Abort error
The library has a typed helper for Abort error detection 
```ts
import { fetch, isAbortError } from 'extended-fetch';

const abortController = new AbortController()
abortController.abort()
try {
  const reference = await fetch(srv.readyCheck(), {
    signal: abortController.signal,
  })
} catch(err) {
  if (isAbortError(e)) {
    // request was aborted
  }
}
```

## Credits

Inspired by https://github.com/JakeChampion/fetch
