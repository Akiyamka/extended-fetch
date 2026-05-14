import { startTestServer } from "./mock-server.mjs";

startTestServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
