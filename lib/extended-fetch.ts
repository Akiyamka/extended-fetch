import type { ExtendedFetchPreferences } from './types'

const ERROR_MSG_TIMEOUT = 'Network request timed out'
const g = globalThis

// ? Do we really need that? Seems work correctly in firefox
const fixUrl = (url: string) => {
  try {
    return url === '' && g.location.href ? g.location.href : url
  } catch (e) {
    return url
  }
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

export default (
  input: RequestInfo | URL,
  init?: RequestInit,
  pref?: ExtendedFetchPreferences
): Promise<Response> =>
  new Promise(async (resolve, reject) => {
    const initBody = init?.body

    const request = (() => {
      try {
        return new Request(input, init)
      } catch (e) {
        reject(e)
      }
    })()

    if (!request) return

    if (request.signal && request.signal.aborted) {
      return reject(
        new DOMException('The operation was aborted.', 'AbortError')
      )
    }

    const xhr = new XMLHttpRequest()

    xhr.onload = (event) => {
      try {
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
      } catch (e) {
        console.log('CATCHED')
        reject(e)
      }
    }

    xhr.onerror = (event) => {
      setTimeout(() => reject(new TypeError('Network request failed')), 0)
    }

    xhr.ontimeout = (event) => {
      setTimeout(() => reject(new TypeError('Network request timed out')), 0)
    }

    xhr.onabort = (event) => {
      setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 0)
    }

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        pref?.onDownloadProgress?.({ progress: event.loaded / event.total, bytes: event.loaded })
      }
    }
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        pref?.onUploadProgress?.({ progress: event.loaded / event.total, bytes: event.loaded })
      }
    })

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
    request.headers.forEach((value, name) =>
      xhr.setRequestHeader(name, value)
    )

    // Handle abort controller signal
    if (request.signal) {
      const xhrAbort = () => xhr.abort()
      request.signal.addEventListener('abort', xhrAbort)

      xhr.onreadystatechange = () => {
        // DONE (success or failure)
        if (xhr.readyState === 4) {
          request.signal.removeEventListener('abort', xhrAbort)
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

export const isAbortError = (err: unknown) =>
  typeof err === 'object' &&
  err !== null &&
  'name' in err &&
  // https://dom.spec.whatwg.org/#aborting-ongoing-activities-example
  err.name === 'AbortError'

  export type { ExtendedFetchPreferences } from './types';