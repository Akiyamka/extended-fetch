import { extendedFetch } from '@akiyamka/extended-fetch';
import { generateFile } from './fileGen';

/* Demo of downloading file */
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

/* Demo of uploading file */
export function setupUpload(
  btn: HTMLButtonElement,
  bar: HTMLDivElement,
  message: HTMLDivElement
) {
  const startUpload = async () => {
    btn.setAttribute('disabled', 'true');
    message.innerHTML = 'Generating file...';
    const file = await generateFile(300 * 1024 * 1024); // 300 MiB
    const formData = new FormData();
    formData.append('file', file, 'random_file_300MB.bin');
    message.innerHTML = 'Sending...';
    const result = await extendedFetch(
      'http://localhost:3000/upload',
      {
        method: 'POST',
        body: formData, 
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

