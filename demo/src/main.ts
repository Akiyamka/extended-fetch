import './style.css';
import typescriptLogo from './typescript.svg';
import viteLogo from '/vite.svg';
import { setupUpload, setupDownload } from './demo.ts';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Extended Fetch Demo</h1>

    <div class="card">
      <div class="grid">

         <button id="download-btn" type="button">Download</button>
         <div class="progress" id="download-progress-bar">0 MiB</div>

         <button id="upload-btn" type="button">Upload</button>
         <div class="progress" id="upload-progress-bar">0 MiB</div>
         <div id="upload-message" class="message"></div>
      </div>
    </div>

    <p class="read-the-docs">
      Click on the upload or download button to see progress bar
    </p>
  </div>
`;

setupUpload(
  document.querySelector<HTMLButtonElement>('#upload-btn')!,
  document.querySelector<HTMLDivElement>('#upload-progress-bar')!,
  document.querySelector<HTMLDivElement>('#upload-message')!
);

setupDownload(
  document.querySelector<HTMLButtonElement>('#download-btn')!,
  document.querySelector<HTMLDivElement>('#download-progress-bar')!
);
