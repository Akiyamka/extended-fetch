import type { ExtendedFetchPreferences } from './types'

const ERROR_MSG_TIMEOUT = 'Network request timed out'
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

function parseHeaders(rawHeaders: string) {
  const headers = new Headers()
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
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
      const parts = line.split(':')
      const key = parts.shift()?.trim()
      if (key) {
        const value = parts.join(':').trim()
        try {
          headers.append(key, value)
        } catch (error) {
          if (error && typeof error === 'object' && 'message' in error) {
            console.warn('Response ' + error.message)
          } else {
            console.warn('Response ' + error)
          }
        }
      }
    })
  return headers
}

const toXMLHttpRequestBodyInit = async (
  body?: BodyInit | null
): Promise<XMLHttpRequestBodyInit | null> => {
  if (body === null || body === undefined) return null
  if (typeof body === 'string') return body
  if ('getReader' in body) {
    return await new Response(body).blob()
  }
  return body
}

export const fetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
  pref?: ExtendedFetchPreferences
) =>
  new Promise(async (resolve, reject) => {
    const initBody = init?.body
    const request = new Request(input, init)

    if (request.signal && request.signal.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'))
    }

    const xhr = new XMLHttpRequest()

    xhr.onloadstart = (event) => {
      pref?.eventListener?.({ type: 'loadstart', payload: event })
    }

    xhr.onload = (event) => {
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
      pref?.eventListener?.({ type: 'load', payload: event })
      setTimeout(() => resolve(new Response(body, options)), 0)
    }

    xhr.onerror = (event) => {
      pref?.eventListener?.({ type: 'error', payload: event })
      setTimeout(() => reject(new TypeError('Network request failed')), 0)
    }

    xhr.ontimeout = (event) => {
      pref?.eventListener?.({ type: 'timeout', payload: event })
      setTimeout(() => reject(new TypeError('Network request timed out')), 0)
    }

    xhr.onabort = (event) => {
      pref?.eventListener?.({ type: 'abort', payload: event })
      setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 0)
    }

    xhr.onprogress = (event) => {
      pref?.eventListener?.({ type: 'progress', payload: event })
    }

    xhr.onloadend = (event) => {
      pref?.eventListener?.({ type: 'loadend', payload: event })
    }

    const fixUrl = (url: string) => {
      try {
        return url === '' && g.location.href ? g.location.href : url
      } catch (e) {
        return url
      }
    }

    xhr.open(request.method, fixUrl(request.url), true)

    // Credentials
    if (request.credentials === 'include') {
      xhr.withCredentials = true
    } else if (request.credentials === 'omit') {
      xhr.withCredentials = false
    }

    if ('responseType' in xhr) {
      xhr.responseType = 'blob'
    }

    // Set Headers
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
        // @ts-expect-error can be statically checked
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

    // Handle abort controller signal
    if (request.signal) {
      request.signal.addEventListener('abort', () => xhr.abort())

      xhr.onreadystatechange = function () {
        // DONE (success or failure)
        if (xhr.readyState === 4) {
          request.signal.removeEventListener('abort', () => xhr.abort())
        }
      }
    }

    const body = await toXMLHttpRequestBodyInit(initBody)
    xhr.send(body)
  })

export const isTimeoutError = (err: unknown) =>
  typeof err === 'object' &&
  err !== null &&
  'message' in err &&
  err.message === ERROR_MSG_TIMEOUT
