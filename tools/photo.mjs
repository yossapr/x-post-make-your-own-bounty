import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

// Photograph the finished banner with the Chrome listening on the debug port.
// The sheet is served over a loopback HTTP server so the wordmark and the code
// font arrive as files, not as blocked file:// requests. Usage: node tools/photo.mjs
const PORT = Number(process.env.CHROME_PORT || 9223);
const SIDE = 1200;
const root = resolve(".");
const photo = resolve("photo.png");
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const giveUp = setTimeout(() => { console.error("photo: the camera did not finish in 90s"); process.exit(1); }, 90_000);

const TYPES = { ".html": "text/html", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
const server = createServer((request, answer) => {
  const path = decodeURIComponent(request.url.split("?")[0]).replace(/^\/+/, "") || "photo.html";
  const file = resolve(root, path);
  if (!file.startsWith(root + sep)) { answer.writeHead(403); answer.end(); return; }
  try {
    const body = readFileSync(file);
    answer.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
    answer.end(body);
  } catch {
    answer.writeHead(404); answer.end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = "http://127.0.0.1:" + server.address().port + "/photo.html";
let socket;

try {
  const answer = await fetch("http://127.0.0.1:" + PORT + "/json/new?about:blank", { method: "PUT" });
  if (!answer.ok) throw new Error("Chrome would not open a tab: " + answer.status);
  const tab = await answer.json();

  socket = new WebSocket(tab.webSocketDebuggerUrl);
  const pending = new Map();
  let counter = 0;
  socket.addEventListener("message", (event) => {
    const reply = JSON.parse(event.data);
    const waiter = pending.get(reply.id);
    if (!waiter) return;
    pending.delete(reply.id);
    if (reply.error) waiter.fail(new Error(reply.error.message));
    else waiter.done(reply.result);
  });
  const ask = (method, params = {}) => new Promise((done, fail) => {
    counter += 1;
    pending.set(counter, { done, fail });
    socket.send(JSON.stringify({ id: counter, method, params }));
  });
  await new Promise((done, fail) => {
    socket.addEventListener("open", done, { once: true });
    socket.addEventListener("error", () => fail(new Error("no socket to Chrome")), { once: true });
  });

  await ask("Page.enable");
  await ask("Runtime.enable");
  await ask("Emulation.setDeviceMetricsOverride", { width: SIDE, height: SIDE, deviceScaleFactor: 1, mobile: false });
  await ask("Page.navigate", { url: base });

  for (let tries = 0; tries < 120; tries += 1) {
    const state = await ask("Runtime.evaluate", { expression: 'document.readyState + "/" + document.fonts.status', returnByValue: true });
    if (state.result.value === "complete/loaded") break;
    await sleep(100);
  }
  await sleep(400);

  const probe = await ask("Runtime.evaluate", {
    expression: [
      "(() => {",
      "  const out = [];",
      "  for (const node of document.querySelectorAll(\"body *\")) {",
      "    const box = node.getBoundingClientRect();",
      "    if (node.classList.contains(\"glow\") || box.width === 0 || box.height === 0) continue;",
      "    if (box.right > 1200.5 || box.bottom > 1200.5 || box.left < -0.5 || box.top < -0.5) out.push((node.className || node.tagName) + \" \" + Math.round(box.left) + \",\" + Math.round(box.top));",
      "  }",
      "  return out.join(\"; \") || \"fits\";",
      "})()",
    ].join("\n"),
    returnByValue: true,
  });
  if (probe.result.value !== "fits") throw new Error("the sheet spills: " + probe.result.value);

  const shot = await ask("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const bytes = Buffer.from(shot.data, "base64");
  writeFileSync(photo, bytes);
  console.log("photo.png: " + readFileSync(photo).length + " bytes, sha256 " + createHash("sha256").update(bytes).digest("hex").toUpperCase());
} catch (error) {
  console.error(String(error?.message ?? error));
  process.exitCode = 1;
} finally {
  clearTimeout(giveUp);
  socket?.close();
  server.closeAllConnections?.();
  server.close();
  setTimeout(() => process.exit(process.exitCode ?? 0), 50);
}
