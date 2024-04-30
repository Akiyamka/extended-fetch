# extended-fetch
![NPM Version](https://img.shields.io/npm/v/%40akiyamka%2Fextended-fetch)
![NPM Type Definitions](https://img.shields.io/npm/types/%40akiyamka%2Fextended-fetch)
[![spring-easing's badge](https://deno.bundlejs.com/badge?q=@akiyamka/extended-fetch@0.0.5&treeshake=[*]&config={%22esbuild%22:{%22format%22:%22esm%22}})](https://bundlejs.com/?q=@akiyamka/extended-fetch) [![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm) [![Module type: CJS](https://img.shields.io/badge/module%20type-cjs-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)  
Tiny window.fetch JavaScript implementation without over XMLHttpRequest with additional features  
Can be used ds drop in replacement for fetch

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
).catch((error) => {
  // Allow identify timeout error
  console.assert(error.message, 'Timeout Error');
  console.assert(isTimeoutError(error), true);
});
```

## Credits

Inspired by https://github.com/JakeChampion/fetch
