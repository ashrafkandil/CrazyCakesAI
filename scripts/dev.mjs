import { spawn, spawnSync, execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const FALLBACK_TIMEOUT_MS = 30_000;
const ANSI_PATTERN = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
const args = process.argv.slice(2);
const usesHttps = args.some((arg) => arg.startsWith("--experimental-https"));
const protocol = usesHttps ? "https" : "http";

function resolvePort() {
  const portIndex = args.findIndex((arg) => arg === "--port" || arg === "-p");
  const flag = portIndex === -1 ? null : args[portIndex + 1];
  return Number.parseInt(flag ?? process.env.PORT ?? "3000", 10) || 3000;
}

const port = resolvePort();

function portListeners(targetPort) {
  const pids = new Set();
  if (process.platform === "win32") {
    const out = execSync("netstat -ano", { encoding: "utf8" });
    for (const line of out.split(/\r?\n/)) {
      const match = line.match(/TCP\s+\S+?:(\d+)\s+\S+\s+LISTENING\s+(\d+)/i);
      if (match && Number.parseInt(match[1], 10) === targetPort) {
        pids.add(Number.parseInt(match[2], 10));
      }
    }
  } else {
    const result = spawnSync("lsof", [`-ti`, `tcp:${targetPort}`, "-sTCP:LISTEN"], {
      encoding: "utf8",
    });
    for (const pid of result.stdout.split(/\r?\n/)) {
      if (pid.trim()) pids.add(Number.parseInt(pid, 10));
    }
  }
  return [...pids].filter((pid) => Number.isFinite(pid) && pid > 0 && pid !== process.pid);
}

function sleepSync(ms) {
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  } catch {
    // ignore
  }
}

function freePort() {
  let killed = [];
  try {
    killed = portListeners(port);
  } catch {
    return killed;
  }
  for (const pid of killed) {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/PID", String(pid), "/F", "/T"], { stdio: "ignore" });
    } else {
      try {
        process.kill(pid, "SIGTERM");
      } catch {
        // already gone
      }
    }
  }
  if (killed.length > 0) {
    for (let attempt = 0; attempt < 10 && portListeners(port).length > 0; attempt += 1) {
      sleepSync(200);
    }
    console.log(`> Stopped existing process(es) on port ${port}: ${killed.join(", ")}`);
  }
  return killed;
}

function readRegValue(key, valueName) {
  const flag = valueName ? `/v ${valueName}` : "/ve";
  const out = execSync(`reg query "${key}" ${flag}`, { encoding: "utf8" });
  for (const line of out.split(/\r?\n/)) {
    const match = line.match(/^\s+(\S+)\s+(REG_[A-Z_]+)\s+(.*)$/);
    if (match) return match[3].trim();
  }
  return null;
}

function defaultBrowserLauncher() {
  if (process.platform !== "win32") return null;
  try {
    const progId = readRegValue(
      "HKCU\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice",
      "ProgId",
    );
    if (!progId) return null;
    const command = readRegValue(`HKCR\\${progId}\\shell\\open\\command`);
    const exe = command?.match(/"([^"]+\.exe)"/i)?.[1] ?? command?.match(/^(\S+\.exe)/i)?.[1];
    if (!exe) return null;
    const signature = `${progId} ${exe}`.toLowerCase();
    if (/firefox/.test(signature)) return { exe, flags: ["-new-window"] };
    if (/chrome|chromium|edge|msedge|brave|vivaldi|opera/.test(signature)) {
      return { exe, flags: ["--new-window"] };
    }
    return null;
  } catch {
    return null;
  }
}

const browserLauncher = defaultBrowserLauncher();

function startFallback(url) {
  const child = spawn("cmd.exe", ["/d", "/s", "/c", `start "" "${url}"`], {
    stdio: "ignore",
    windowsHide: true,
  });
  child.on("error", () => console.log(`Open ${url} manually in your browser.`));
  child.unref();
}

function openBrowser(url) {
  if (browserLauncher) {
    const child = spawn(browserLauncher.exe, [...browserLauncher.flags, url], {
      stdio: "ignore",
      detached: true,
    });
    child.on("error", () => startFallback(url));
    child.unref();
    return;
  }
  if (process.platform === "win32") {
    startFallback(url);
    return;
  }
  const command = process.platform === "darwin" ? "open" : "xdg-open";
  const child = spawn(command, [url], { stdio: "ignore", detached: true });
  child.on("error", () => console.log(`Open ${url} manually in your browser.`));
  child.unref();
}

function resolveUrl(chunk) {
  const plain = chunk.replace(ANSI_PATTERN, "");
  const match = plain.match(/Local:\s+(https?:\/\/\S+)/);
  if (match) return match[1].replace(/[.!)]+$/, "");

  const fallback = plain.match(/(?:localhost|127\.0\.0\.1):(\d{2,5})/);
  return fallback
    ? `${protocol}://localhost:${fallback[1]}`
    : `${protocol}://localhost:${port}`;
}

freePort();

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
