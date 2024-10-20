import http from 'node:http';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';

const PORT = 3000;
const FILE_SIZE = 300 * 1024 * 1024; // 30 MB in bytes

const generateRandomStream = function* (size) {
  let bytesGenerated = 0;
  while (bytesGenerated < size) {
    const chunkSize = Math.min(64 * 1024, size - bytesGenerated); // 64KB chunks
    yield crypto.randomBytes(chunkSize);
    bytesGenerated += chunkSize;
  }
};

export const handleUpload = async (req, res) => {
  let bytesReceived = 0;
  for await (const chunk of req) {
    bytesReceived += chunk.length;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      message: 'File upload complete',
      bytesReceived: bytesReceived,
      timestamp: new Date().toISOString(),
    })
  );
};

export const handleDownload = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment; filename="random_30MB.bin"',
    'Content-Length': FILE_SIZE,
  });

  const randomStream = Readable.from(generateRandomStream(FILE_SIZE));
  randomStream.pipe(res);
};

const handleCORS = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }
  return false;
};

const handle404 = (res) => {
  const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Page Not Found</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
                h1 { color: #444; }
                a { color: #0066cc; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
    
        </head>
        <body>
            <h1>Mock server started successfully</h1>
            <a id="link">Click here to start</a>
        </body>
        <script>
          document.querySelector('#link').setAttribute('href', 'https://' + location.host.replace(${PORT}, '5173'))
        </script>
        </html>
    `;
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(html);
};
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/upload') {
    handleUpload(req, res);
  } else if (req.method === 'GET' && req.url === '/download') {
    handleDownload(req, res);
  } else if (req.method === 'OPTIONS' && req.url === '/upload') {
    handleCORS(req, res);
  } else {
    handle404(res);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
