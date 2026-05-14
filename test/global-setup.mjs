import { startTestServer } from "./mock-server.mjs";

// In Vitest 4 browser mode, `globalSetup` runs once per browser project
// (chromium/firefox/webkit). Only the first invocation should bind the mock
// server; the rest see the port as occupied and become no-ops.
export default async function globalSetup() {
  let server;
  try {
    ({ server } = await startTestServer());
  } catch (error) {
    if (error?.code === "EADDRINUSE") return () => {};
    throw error;
  }

  return () =>
    new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
}
