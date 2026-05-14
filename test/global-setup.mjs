import { startTestServer } from "./mock-server.mjs";

export default async function globalSetup() {
  const { server } = await startTestServer();

  return async () =>
    new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
}
