import { beforeEach, describe, expect, test } from 'vitest'
import { extendedFetch, isAbortError } from '../lib/extended-fetch'
import { Cookie, DevServerClient } from '../lib/utils'
import { ALLOWED_HEADERS, ECHO_SRV_HOST, CHECK_PHRASE } from './constants.json'

const [host, port = 80] = ECHO_SRV_HOST.split(':')
const srv = new DevServerClient(`https://${host}:${port}`)

describe('Check test env', () => {
  test('XMLHttpRequest available', () => {
    expect(XMLHttpRequest).toBeDefined()
  })

  test('fetch available', () => {
    expect(fetch).toBeDefined()
  })

  test('e2e test server setup successful', async () => {
    const response = await fetch(srv.readyCheck()).then((r) => r.text())
    expect(response).toBe(CHECK_PHRASE)
  })
})

describe('Payload', () => {
  test('can send and receive multipart payload', async () => {
    const form = new FormData()
    form.append('field', 'value')
    form.append(
      'file',
      new Blob(['hello world'], { type: 'text/plain' }),
      'hello.txt'
    )

    const result = await extendedFetch(srv.echoBody(), {
      method: 'POST',
      body: form,
    }).then((r) => r.json())

    // The boundary declared in Content-Type must actually appear in the body —
    // otherwise the server cannot find the parts. This is the regression guard
    // for the FormData boundary mismatch: previously `new Request(...)` populated
    // Content-Type with boundary A, then `xhr.send(formData)` re-encoded the body
    // with boundary B, leaving header and body out of sync.
    const contentType: string = result['content-type']
    const match = /boundary=(.+)$/.exec(contentType)
    expect(
      match,
      'Content-Type must declare a multipart boundary'
    ).not.toBeNull()
    const boundary = match![1]

    expect(result.body).toContain(`--${boundary}`)
    expect(result.body).toContain('name="field"')
    expect(result.body).toContain('value')
    expect(result.body).toContain('name="file"')
    expect(result.body).toContain('filename="hello.txt"')
    expect(result.body).toContain('hello world')
  })

  test.todo('can send and receive blob payload', async () => {})
})

describe('Headers', () => {
  // Firefox sends `priority` (RFC 9218) on `fetch()` but not on XHR, so the
  // reference response carries a header that the XHR-based result cannot mirror.
  const stripBrowserOnlyHeaders = (h: Record<string, unknown>) => {
    const { priority: _priority, ...rest } = h
    return rest
  }

  test('sended correctly', async () => {
    const reference = await fetch(srv.echoHeaders()).then((r) => r.json())
    const result = await extendedFetch(srv.echoHeaders()).then((r) => r.json())
    expect(stripBrowserOnlyHeaders(reference)).toEqual(
      stripBrowserOnlyHeaders(result)
    )
  })

  test('parsed correctly', async () => {
    const headers = {
      [ALLOWED_HEADERS[0]]: 'test-header-value',
      [ALLOWED_HEADERS[1]]: 'test-header-value2',
    }

    const reference = await fetch(srv.echoHeaders(), {
      headers,
    }).then((r) => r.json())

    const result = await extendedFetch(srv.echoHeaders(), {
      headers,
    }).then((r) => r.json())

    expect(stripBrowserOnlyHeaders(reference)).toEqual(
      stripBrowserOnlyHeaders(result)
    )
  })

  test('throw error for bad char in name', async () => {
    const request = () =>
      extendedFetch(srv.echoHeaders(), {
        headers: {
          bad_heаder: 'placeholder',
        },
      })

    // Error message text differs across engines:
    //   Chromium: "Failed to read the 'headers' property…"
    //   Firefox:  "Request constructor: Cannot convert …"
    //   WebKit:   "Type error"
    await expect(() => request()).rejects.toThrowError(
      /Failed to read the 'headers' property|Cannot convert|Type error/i
    )
  })

  describe('credentials', () => {
    interface CredentialsTestContext {
      cookie: Cookie
    }

    beforeEach<CredentialsTestContext>((context) => {
      const cookie = new Cookie('foo', 'bar')
      context.cookie = cookie
      return () => cookie.destroy()
    })

    test<CredentialsTestContext>('include', async ({ cookie }) => {
      const reference = await fetch(srv.echoHeaders(), {
        credentials: 'include',
      }).then((r) => r.json())
      const result = await extendedFetch(srv.echoHeaders(), {
        credentials: 'include',
      }).then((r) => r.json())
      expect(stripBrowserOnlyHeaders(reference)).toEqual(
        stripBrowserOnlyHeaders(result)
      )
      expect(reference.cookie).toEqual(cookie.value)
    })

    test('omit', async () => {
      const reference = await fetch(srv.echoHeaders(), {
        credentials: 'omit',
      }).then((r) => r.json())
      const result = await extendedFetch(srv.echoHeaders(), {
        credentials: 'omit',
      }).then((r) => r.json())
      expect(stripBrowserOnlyHeaders(reference)).toEqual(
        stripBrowserOnlyHeaders(result)
      )
      expect(reference.cookie).toBeUndefined()
    })
  })
})

describe('Progress', () => {
  test.todo('onUploadProgress', () => {})
  test.todo('onDownloadProgress', () => {})
})

describe('Abort', () => {
  test('throw same error for already aborted signal', async () => {
    const abortController = new AbortController()
    abortController.abort()
    const reference = await fetch(srv.readyCheck(), {
      signal: abortController.signal,
    }).catch((e) => e.name)
    const result = await extendedFetch(srv.readyCheck(), {
      signal: abortController.signal,
    }).catch((e) => e.name)
    expect(reference).toEqual(result)
  })
})

describe('Utils', () => {
  test('isAbortError', async () => {
    const abortController = new AbortController()
    abortController.abort()
    const result = await extendedFetch(srv.readyCheck(), {
      signal: abortController.signal,
    }).catch((e) => e)
    expect(isAbortError(result)).toBe(true)
  })
})
