import { beforeEach, describe, expect, test } from 'vitest'
import { extendedFetch, isAbortError } from '../lib/extended-fetch'
import { Cookie, DevServerClient } from '../lib/utils'
import {
  ALLOWED_HEADERS,
  ECHO_SRV_HOST,
  CHECK_PHRASE,
} from './constants.json'

const [host, port = 80] = ECHO_SRV_HOST.split(':')
const srv = new DevServerClient(`http://${host}:${port}`)

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
  test.todo('can send and receive multipart payload', async () => {
  })

  test.todo('can send and receive blob payload', async () => {
  })
})

describe('Headers', () => {
  test('sended correctly', async () => {
    const reference = await fetch(srv.echoHeaders()).then((r) => r.json())
    const result = await extendedFetch(srv.echoHeaders()).then((r) => r.json())
    expect(reference).toEqual(result)
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

    expect(reference).toEqual(result)
  })

  test('throw error for bad char in name', async () => {
    const request = () =>
      extendedFetch(srv.echoHeaders(), {
        headers: {
          bad_heаder: 'placeholder',
        },
      })

    await expect(() => request()).rejects.toThrowError(/Failed to read the 'headers' property/)
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
      expect(reference).toEqual(result)
      expect(reference.cookie).toEqual(cookie.value)
    })

    test('omit', async () => {
      const reference = await fetch(srv.echoHeaders(), {
        credentials: 'omit',
      }).then((r) => r.json())
      const result = await extendedFetch(srv.echoHeaders(), {
        credentials: 'omit',
      }).then((r) => r.json())
      expect(reference).toEqual(result)
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

