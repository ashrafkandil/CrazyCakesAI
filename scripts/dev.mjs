import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const FALLBACK_TIMEOUT_MS = 30_000;
const ANSI_PATTERN = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
const args = process.argv.slice(2);
const usesHttps = args.some((arg) => arg.startsWith("--experimental-https"));
const protocol = usesHttps ? "https" : "http";

function resolveUrl(chunk) {
  const plain = chunk.replace(ANSI_PATTERN, "");
  const match = plain.match(/Local:\s+(https?:\/\/\S+)/);
  if (match) return match[1].replace(/[.!)]+$/, "");

  const portIndex = args.findIndex((arg) => arg === "--port" || arg === "-p");
  const portFlag = portIndex === -1 ? null : args[portIndex + 1];
  const port = portFlag ?? process.env.PORT ?? "3000";
  const fallback = plain.match(/(?:localhost|127\.0\.0\.1):(\d{2,5})/);
  return fallback ? `${protocol}://localhost:${fallback[1]}` : `${protocol}://localhost:${port}`;
}

function openBrowser(url) {
  const opener =
    process.platform === "win32"
      ? { command: "cmd.exe", args: ["/d", "/s", "/c", `start "" "${url}"`] }
      : { command: process.platform === "darwin" ? "open" : "xdg-open", args: [url] };

  const child = spawn(opener.command, opener.args, { stdio: "ignore", windowsHide: true });
  child.on("error", () => console.log(`Open ${url} manually in your browser.`));
  child.unref();
}

const server = spawn(process.execPath, [nextBin, "dev", ...args], {
  cwd: process.cwd(),
  env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR ?? "1" },
  stdio: ["inherit", "pipe", "pipe"],
});

let opened = false;

function launch(target) {
  if (opened || !target) return;
  opened = true;
  clearTimeout(fallbackTimer);
  openBrowser(target);
}

const fallbackTimer = setTimeout(() => launch(resolveUrl("")), FALLBACK_TIMEOUT_MS);
fallbackTimer.unref();

function forward(stream, output) {
  let buffer = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    output.write(chunk);
    buffer = (buffer + chunk).slice(-4000);
    if (opened) return;
    if (!/(Local:|localhost|127\.0\.0\.1)/.test(buffer)) return;
    launch(resolveUrl(buffer));
  });
}

forward(server.stdout, process.stdout);
forward(server.stderr, process.stderr);

server.on("error", (error) => {
  clearTimeout(fallbackTimer);
  console.error(error);
  process.exit(1);
});

server.on("exit", (code, signal) => {
  clearTimeout(fallbackTimer);
  process.exit(signal === "SIGINT" ? 130 : (code ?? 0));
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (!server.killed) server.kill(signal);
  });
}
