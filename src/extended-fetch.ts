import type { ExtendedFetchPreferences } from './types'

const g = globalThis

function normalizeName(name: string) {
  if (typeof name !== 'string') {
    name = String(name)
  }
  if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
    throw new TypeError(
      'Invalid character in header field name: "' + name + '"'
    )
  }
  return name.toLowerCase()
}

function parseHeaders(rawHeaders) {
  var headers = new Headers()
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
  // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
  // https://github.com/github/fetch/issues/748
  // https://github.com/zloirock/core-js/issues/751

  preProcessedHeaders
    .split('\r')
    .map((header) => {
      return header.indexOf('\n') === 0
        ? header.substr(1, header.length)
        : header
    })
    .forEach((line) => {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        try {
          headers.append(key, value)
        } catch (error) {
          console.warn('Response ' + error.message)
        }
      }
    })
  return headers
}

export const fetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
  pref?: ExtendedFetchPreferences
) =>
  new Promise((resolve, reject) => {
    const request = new Request(input, init)

    if (request.signal && request.signal.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'))
    }

    const xhr = new XMLHttpRequest()

    xhr.onload = () => {
      // This check if specifically for when a user fetches a file locally from the file system
      // Only if the status is out of a normal range
      const isOk =
        request.url.indexOf('file://') === 0 &&
        (xhr.status < 200 || xhr.status > 599)

      const options: {
        statusText: string
        headers: Headers
        status?: number
        url?: string | null
      } = {
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || ''),
        status: isOk ? 200 : xhr.status,
      }

      options.url =
        'responseURL' in xhr
          ? xhr.responseURL
          : options.headers.get('X-Request-URL')
      // @ts-expect-error responseText can be in some implementations
      const body = 'response' in xhr ? xhr.response : xhr.responseText
      setTimeout(() => resolve(new Response(body, options)), 0)
    }

    xhr.onerror = () =>
      setTimeout(() => reject(new TypeError('Network request failed')), 0)
    xhr.ontimeout = () =>
      setTimeout(() => reject(new TypeError('Network request timed out')), 0)
    xhr.onabort = () =>
      setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 0)

    const fixUrl = (url: string) => {
      try {
        return url === '' && g.location.href ? g.location.href : url
      } catch (e) {
        return url
      }
    }

    xhr.open(request.method, fixUrl(request.url), true)

    if (request.credentials === 'include') {
      xhr.withCredentials = true
    } else if (request.credentials === 'omit') {
      xhr.withCredentials = false
    }

    if ('responseType' in xhr) {
      xhr.responseType = 'blob'
    }

    if (
      init &&
      typeof init.headers === 'object' &&
      !(
        init.headers instanceof Headers ||
        (g.Headers && init.headers instanceof g.Headers)
      )
    ) {
      const names: string[] = []
      Object.getOwnPropertyNames(init.headers).forEach((name) => {
        names.push(normalizeName(name))
        xhr.setRequestHeader(name, String(init.headers![name]))
      })
      request.headers.forEach((value, name) => {
        if (names.indexOf(name) === -1) {
          xhr.setRequestHeader(name, value)
        }
      })
    } else {
      request.headers.forEach((value, name) =>
        xhr.setRequestHeader(name, value)
      )
    }

    if (request.signal) {
      request.signal.addEventListener('abort', () => xhr.abort())

      xhr.onreadystatechange = function () {
        // DONE (success or failure)
        if (xhr.readyState === 4) {
          request.signal.removeEventListener('abort', () => xhr.abort())
        }
      }
    }

    xhr.send(
      typeof request._bodyInit === 'undefined' ? null : request._bodyInit
    )
  })
