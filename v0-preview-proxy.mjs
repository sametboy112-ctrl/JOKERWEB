// v0 preview proxy: the v0 sandbox exposes the app on port 3000, but this
// Lovable/TanStack Start config hard-locks Vite to port 8080. This tiny
// zero-dependency proxy forwards HTTP + WebSocket (HMR) traffic from 3000
// to Vite on 8080 so the in-v0 preview works. It is dev-only and has no
// effect on production builds/deploys.
import http from "node:http";
import net from "node:net";

const LISTEN_PORT = Number(process.env.PORT) || 3000;
const TARGET_HOST = "127.0.0.1";
const TARGET_PORT = 8080;

const server = http.createServer((clientReq, clientRes) => {
  const options = {
    host: TARGET_HOST,
    port: TARGET_PORT,
    method: clientReq.method,
    path: clientReq.url,
    headers: clientReq.headers,
  };
  const proxyReq = http.request(options, (proxyRes) => {
    clientRes.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(clientRes, { end: true });
  });
  proxyReq.on("error", () => {
    if (!clientRes.headersSent) clientRes.writeHead(502);
    clientRes.end("Proxy target (vite:8080) unavailable");
  });
  clientReq.pipe(proxyReq, { end: true });
});

// Tunnel WebSocket upgrades (used by Vite HMR).
server.on("upgrade", (req, clientSocket, head) => {
  const upstream = net.connect(TARGET_PORT, TARGET_HOST, () => {
    const headerLines = [`${req.method} ${req.url} HTTP/1.1`];
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      headerLines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
    }
    upstream.write(headerLines.join("\r\n") + "\r\n\r\n");
    if (head && head.length) upstream.write(head);
    upstream.pipe(clientSocket);
    clientSocket.pipe(upstream);
  });
  upstream.on("error", () => clientSocket.destroy());
  clientSocket.on("error", () => upstream.destroy());
});

server.listen(LISTEN_PORT, "0.0.0.0", () => {
  console.log(`[v0-preview-proxy] :${LISTEN_PORT} -> vite :${TARGET_PORT}`);
});
