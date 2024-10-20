import './style.css';
import npmLogo from '/npm.svg';
import { setupUpload, setupDownload } from './demo.ts';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://github.com/Akiyamka/extended-fetch" target="_blank" style="color: inherit">
      <svg class="logo vanilla" version="1.2" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 2350 2314.8" xml:space="preserve">
        <path d="M1175,0C525.8,0,0,525.8,0,1175c0,552.2,378.9,1010.5,890.1,1139.7c-5.9-14.7-8.8-35.3-8.8-55.8v-199.8H734.4  c-79.3,0-152.8-35.2-185.1-99.9c-38.2-70.5-44.1-179.2-141-246.8c-29.4-23.5-5.9-47,26.4-44.1c61.7,17.6,111.6,58.8,158.6,120.4  c47,61.7,67.6,76.4,155.7,76.4c41.1,0,105.7-2.9,164.5-11.8c32.3-82.3,88.1-155.7,155.7-190.9c-393.6-47-581.6-240.9-581.6-505.3  c0-114.6,49.9-223.3,132.2-317.3c-26.4-91.1-61.7-279.1,11.8-352.5c176.3,0,282,114.6,308.4,143.9c88.1-29.4,185.1-47,284.9-47  c102.8,0,196.8,17.6,284.9,47c26.4-29.4,132.2-143.9,308.4-143.9c70.5,70.5,38.2,261.4,8.8,352.5c82.3,91.1,129.3,202.7,129.3,317.3  c0,264.4-185.1,458.3-575.7,499.4c108.7,55.8,185.1,214.4,185.1,331.9V2256c0,8.8-2.9,17.6-2.9,26.4  C2021,2123.8,2350,1689.1,2350,1175C2350,525.8,1824.2,0,1175,0L1175,0z" fill="currentColor"/>
      </svg>
    </a>
    <a href="https://www.npmjs.com/package/@akiyamka/extended-fetch" target="_blank">
      <img src="${npmLogo}" class="logo vanilla" alt="TypeScript logo" />
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
