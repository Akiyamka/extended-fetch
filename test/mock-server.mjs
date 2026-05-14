import http from "node:http";
import constants from "./constants.json" with { type: "json" };

const [host, rawPort = "80"] = constants.ECHO_SRV_HOST.split(":");
const port = Number(rawPort);

const requestHandler = (req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    `http://${constants.TEST_SRV_HOST}`,
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
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              "content-type": req.headers["content-type"] ?? null,
              body: Buffer.concat(chunks).toString("utf8"),
            }),
          );
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

export const createTestServer = () => http.createServer(requestHandler);

export const startTestServer = () =>
  new Promise((resolve, reject) => {
    const server = createTestServer();

    const onError = (error) => reject(error);
    server.once("error", onError);

    server.listen(port, host, () => {
      server.off("error", onError);
      console.log(`Server is running at ${host}:${port}`);
      resolve({ server, host, port });
    });
  });
