import { generate } from "selfsigned";

let cached;

export async function getDevCert() {
  if (cached) return cached;
  // Extensions mirror @vitejs/plugin-basic-ssl — without basicConstraints /
  // keyUsage / extKeyUsage modern TLS stacks (Chromium especially) reject the
  // handshake with ERR_SSL_VERSION_OR_CIPHER_MISMATCH.
  const { private: key, cert } = await generate(
    [{ name: "commonName", value: "localhost" }],
    {
      days: 1,
      keySize: 2048,
      algorithm: "sha256",
      extensions: [
        { name: "basicConstraints", cA: true },
        {
          name: "keyUsage",
          digitalSignature: true,
          keyEncipherment: true,
          dataEncipherment: true,
          keyCertSign: true,
        },
        { name: "extKeyUsage", serverAuth: true, clientAuth: true },
        {
          name: "subjectAltName",
          altNames: [
            { type: 2, value: "localhost" },
            { type: 7, ip: "127.0.0.1" },
          ],
        },
      ],
    },
  );
  cached = { key, cert };
  return cached;
}
