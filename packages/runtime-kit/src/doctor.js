import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import os from "node:os";
import { repoRoot } from "./paths.js";

/** Bundled Arnold Trembley MinGW build (no admin install). */
export function bundledGnuCobolRoot() {
  return path.join(repoRoot(), "tools", "gnucobol", "dist");
}

export function bundledCobcPath() {
  const exe = process.platform === "win32" ? "cobc.exe" : "cobc";
  const candidate = path.join(bundledGnuCobolRoot(), "bin", exe);
  return fs.existsSync(candidate) ? candidate : null;
}

/**
 * Env vars required by MinGW GnuCOBOL (mirrors set_env.cmd).
 */
export function gnuCobolEnv(baseEnv = process.env) {
  const root = bundledGnuCobolRoot();
  const bin = path.join(root, "bin");
  const env = { ...baseEnv };
  if (!fs.existsSync(bin)) return env;

  const sep = path.delimiter;
  env.COB_MAIN_DIR = root.endsWith(path.sep) ? root : root + path.sep;
  env.COB_CONFIG_DIR = path.join(root, "config");
  env.COB_COPY_DIR = path.join(root, "copy");
  env.COB_CFLAGS = `-I"${path.join(root, "include")}"`;
  env.COB_LDFLAGS = `-L"${path.join(root, "lib")}"`;
  env.COB_LIBRARY_PATH = path.join(root, "extras");
  env.PATH = `${bin}${sep}${env.PATH || ""}`;
  return env;
}

function whichCobc() {
  const cmd = process.platform === "win32" ? "where" : "which";
  const result = spawnSync(cmd, ["cobc"], { encoding: "utf8", env: gnuCobolEnv() });
  if (result.status === 0) {
    const line = (result.stdout || "").split(/\r?\n/).map((s) => s.trim()).find(Boolean);
    return line || null;
  }
  return null;
}

export function findCobc() {
  const fromPath = whichCobc();
  if (fromPath) return fromPath;
  return bundledCobcPath();
}

export function cobcVersion(cobcPath = "cobc") {
  const result = spawnSync(cobcPath, ["--version"], {
    encoding: "utf8",
    env: gnuCobolEnv(),
  });
  if (result.status !== 0) return null;
  return (result.stdout || result.stderr || "").trim().split(/\r?\n/)[0];
}

export function installHints() {
  const platform = os.platform();
  if (platform === "win32") {
    return [
      "Windows: GnuCOBOL not found.",
      "Quick fix (no Admin):",
      "  powershell -ExecutionPolicy Bypass -File scripts\\setup-gnucobol-windows.ps1",
      "That downloads a portable MinGW build into tools\\gnucobol\\dist",
      "Then: npm run doctor",
      "Alt: Chocolatey Admin → choco install gnucobol -y",
    ];
  }
  if (platform === "darwin") {
    return ["macOS: brew install gnucobol", "Then: npm run doctor"];
  }
  return [
    "Linux (Debian/Ubuntu): sudo apt update && sudo apt install -y gnucobol",
    "Cloud (Render): use the repo Dockerfile (apt gnucobol) — see docs/RENDER.md",
    "Then: npm run doctor",
  ];
}

export function doctor() {
  const cobc = findCobc();
  const version = cobc ? cobcVersion(cobc) : null;
  const ok = Boolean(cobc && version);
  const bundled = Boolean(bundledCobcPath() && cobc && path.resolve(cobc) === path.resolve(bundledCobcPath()));
  return {
    ok,
    cobc,
    version,
    bundled,
    platform: os.platform(),
    hints: ok ? [] : installHints(),
    message: ok
      ? `GnuCOBOL OK — ${version}${bundled ? " (bundled tools/gnucobol)" : ""}`
      : "GnuCOBOL (cobc) not found. Run scripts/setup-gnucobol-windows.ps1 then Doctor.",
  };
}
