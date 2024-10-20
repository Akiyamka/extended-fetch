import { extendedFetch } from '@akiyamka/extended-fetch';

function generateRandomContent(bytes: number): Promise<ArrayBuffer> {
  return new Promise((res) => {
    setTimeout(() => {
      const buffer = new ArrayBuffer(bytes);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < bytes; i++) {
        view[i] = Math.floor(Math.random() * 256);
      }
      res(buffer);
    });
  });
}

export function setupUpload(
  btn: HTMLButtonElement,
  bar: HTMLDivElement,
  message: HTMLDivElement
) {
  const startUpload = async () => {
    message.innerHTML = '';
    btn.setAttribute('disabled', 'true');
    const result = await extendedFetch(
      'http://localhost:3000/upload',
      {
        method: 'POST',
        body: await generateRandomContent(300 * 1024 * 1024), // 300 MiB
      },
      {
        onUploadProgress: (event) => {
          const percent = Math.floor(event.progress * 100) + '%';
          bar.style.setProperty('--percent', percent);
          bar.innerHTML = `${(event.bytes / 1048576).toFixed(2)} MiB`;
        },
      }
    );
    const meta: { message: string; bytesReceived: number } =
      await result.json();
    message.innerHTML = `${meta.message}. Bytes recieved: ${meta.bytesReceived} `;
    btn.removeAttribute('disabled');
  };
  btn.addEventListener('click', () => startUpload());
}

export function setupDownload(btn: HTMLButtonElement, bar: HTMLDivElement) {
  const startDownload = async () => {
    btn.setAttribute('disabled', 'true');
    await extendedFetch(
      'http://localhost:3000/download',
      {},
      {
        onDownloadProgress: (event) => {
          const percent = Math.floor(event.progress * 100) + '%';
          bar.style.setProperty('--percent', percent);
          bar.innerHTML = `${(event.bytes / 1048576).toFixed(2)} MiB`;
        },
      }
    );
    btn.removeAttribute('disabled');
  };

  btn.addEventListener('click', () => startDownload());
}
