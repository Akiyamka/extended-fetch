import https from "node:https";
import constants from "./constants.json" with { type: "json" };
import { getDevCert } from "./dev-cert.mjs";

const [host, rawPort = "80"] = constants.ECHO_SRV_HOST.split(":");
const port = Number(rawPort);

const requestHandler = (req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    `https://${constants.TEST_SRV_HOST}`,
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Headers",
    constants.ALLOWED_HEADERS.join(", "),
  );

  try {
    switch (req.url) {
      case "/rdycheck":
        res.writeHead(200);
        res.end(constants.CHECK_PHRASE);
        return;

      case "/echo-headers":
        res.writeHead(200);
        res.end(JSON.stringify(req.headers));
        return;

      case "/echo-body": {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
          // Set Content-Length explicitly so the response isn't chunked.
          // Without it, XHR's `progress` events report `lengthComputable=false`
          // and download-progress callbacks can't compute a ratio.
          const payload = JSON.stringify({
            "content-type": req.headers["content-type"] ?? null,
            body: Buffer.concat(chunks).toString("utf8"),
          });
          res.writeHead(200, {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          });
          res.end(payload);
        });
        return;
      }

      case "/timeout-error":
      case "/throw-error":
      default:
        res.writeHead(404);
        res.end("Not found");
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(error instanceof Error ? error.message : String(error));
  }
};

export const createTestServer = async () =>
  https.createServer(await getDevCert(), requestHandler);

export const startTestServer = async () => {
  const server = await createTestServer();
  return new Promise((resolve, reject) => {
    const onError = (error) => reject(error);
    server.once("error", onError);

    server.listen(port, host, () => {
      server.off("error", onError);
      console.log(`Server is running at ${host}:${port}`);
      resolve({ server, host, port });
    });
  });
};
