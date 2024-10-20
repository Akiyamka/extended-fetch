const CHUNK_SIZE = 1024 * 1024; // 1 MB

function generateRandomChunk(size: number) {
  const chunk = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    chunk[i] = Math.floor(Math.random() * 256);
  }
  return chunk;
}

function generateNextChunk(chunkSize: number) {
  return new Promise<Uint8Array>((resolve) => {
    setTimeout(() => {
      const chunk = generateRandomChunk(chunkSize);
      resolve(chunk);
    }, 0);
  });
}

export async function generateFile(bytes: number) {
  const chunks = [];
  let bytesGenerated = 0;

  while (bytesGenerated < bytes) {
    const remainingBytes = bytes - bytesGenerated;
    const chunkSize = Math.min(CHUNK_SIZE, remainingBytes);
    const chunk = await generateNextChunk(chunkSize);
    bytesGenerated += chunkSize;
    chunks.push(chunk);
    // updateProgress((bytesGenerated / bytes) * 100);
  }

  const blob = new Blob(chunks, { type: 'application/octet-stream' });
  return blob;
}

