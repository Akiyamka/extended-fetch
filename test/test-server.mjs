import http from 'node:http'
import constants from './constants.json' assert { type: 'json' };

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', `http://${constants.TEST_SRV_HOST}`)
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Headers', constants.ALLOWED_HEADERS.join(', '))

  try {
    switch (req.url) {
      case '/rdycheck':
        res.writeHead(200)
        res.end(constants.CHECK_PHRASE);
        return;

      case '/echo-headers':
        res.writeHead(200)
        res.end(JSON.stringify(req.headers))
        return;

      case '/echo-body':
        // res.writeHead(200)
        // res.end('Test text')

      case '/timeout-error':
        // res.writeHead(200)
        // res.end({ foo: 'bar' })

      case '/throw-error':
        // res.writeHead(200)
        // res.end({ foo: 'bar' })

      default:
        res.writeHead(404)
        res.end('Not found')
    }
  } catch (e) {
    console.error(e)
    res.writeHead(500)
    res.end(e.message)
  }
})

const [host, port = 80] = constants.ECHO_SRV_HOST.split(':')
server.listen(port, host, () => {
  console.log(`Server is running at ${host}:${port}`)
})
