# extended-fetch

A window.fetch JavaScript implementation with additional features

## Usage

Works just like whatwg fetch but you can

### Catch timeout error

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
